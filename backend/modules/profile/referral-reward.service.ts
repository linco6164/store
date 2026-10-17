import mongoose from "mongoose";

import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js";
import { notificationService } from "../notification/notification.service.js";
import OrderModel from "../order/order.model.js";
import WalletTransaction from "../wallet/wallet.model.js";

export const REFERRAL_REWARD_AMOUNT = 100;
export const REFERRAL_REQUIRED_LISTINGS = 2;
export const REFERRAL_REQUIRED_COMPLETED_SALES = 1;

class ReferralRewardService {
  async getProgress(invitedUserId: string) {
    const user = await User.findById(invitedUserId)
      .select(
        "referredBy referralAcceptedAt referralRewardGrantedAt referralQualifiedOrder",
      )
      .lean();

    if (!user?.referredBy) {
      return null;
    }

    const acceptedAt = user.referralAcceptedAt ?? new Date(0);
    const eligibleListings = await ListingModel.find({
      seller: invitedUserId,
      createdAt: { $gte: acceptedAt },
    })
      .select("_id")
      .lean();
    const eligibleListingIds = eligibleListings.map((listing) => listing._id);

    const completedSale = eligibleListingIds.length
      ? await OrderModel.findOne({
          seller: invitedUserId,
          listing: { $in: eligibleListingIds },
          status: "completed",
        })
          .select("_id listing completedAt")
          .lean()
      : null;

    const listingsPublished = eligibleListingIds.length;
    const rewardGranted = Boolean(user.referralRewardGrantedAt);
    const requirementsMet =
      listingsPublished >= REFERRAL_REQUIRED_LISTINGS &&
      completedSale != null;

    return {
      listingsPublished,
      listingsRequired: REFERRAL_REQUIRED_LISTINGS,
      completedSales: completedSale == null ? 0 : 1,
      completedSalesRequired: REFERRAL_REQUIRED_COMPLETED_SALES,
      requirementsMet,
      rewardGranted,
      rewardAmount: REFERRAL_REWARD_AMOUNT,
      rewardGrantedAt: user.referralRewardGrantedAt ?? null,
      qualifiedOrderId:
        user.referralQualifiedOrder?.toString() ??
        completedSale?._id?.toString() ??
        null,
    };
  }

  async evaluate(invitedUserId: string) {
    if (!mongoose.Types.ObjectId.isValid(invitedUserId)) {
      return false;
    }

    const quickProgress = await this.getProgress(invitedUserId);

    if (
      !quickProgress ||
      quickProgress.rewardGranted ||
      !quickProgress.requirementsMet
    ) {
      return false;
    }

    const session = await mongoose.startSession();
    let reward:
      | {
          invitedUserId: string;
          referrerId: string;
          qualifyingOrderId: string;
        }
      | undefined;

    try {
      await session.withTransaction(async () => {
        // withTransaction poate relua callback-ul după o eroare tranzitorie.
        reward = undefined;

        const invitedUser = await User.findOne({
          _id: invitedUserId,
          referredBy: { $ne: null },
          referralRewardGrantedAt: null,
        })
          .select("referredBy referralAcceptedAt")
          .session(session);

        if (!invitedUser?.referredBy) return;

        const acceptedAt = invitedUser.referralAcceptedAt ?? new Date(0);
        const eligibleListings = await ListingModel.find({
          seller: invitedUserId,
          createdAt: { $gte: acceptedAt },
        })
          .select("_id")
          .session(session)
          .lean();
        const eligibleListingIds = eligibleListings.map(
          (listing) => listing._id,
        );

        if (eligibleListingIds.length < REFERRAL_REQUIRED_LISTINGS) return;

        const qualifyingOrder = await OrderModel.findOne({
          seller: invitedUserId,
          listing: { $in: eligibleListingIds },
          status: "completed",
        })
          .select("_id")
          .session(session);

        if (!qualifyingOrder) return;

        const referrerId = invitedUser.referredBy.toString();
        const now = new Date();

        const rewardedInvitee = await User.findOneAndUpdate(
          {
            _id: invitedUserId,
            referralRewardGrantedAt: null,
          },
          {
            $inc: { balance: REFERRAL_REWARD_AMOUNT },
            $set: {
              referralRewardGrantedAt: now,
              referralQualifiedOrder: qualifyingOrder._id,
            },
          },
          { new: true, session },
        );

        if (!rewardedInvitee) return;

        const rewardedReferrer = await User.findByIdAndUpdate(
          referrerId,
          { $inc: { balance: REFERRAL_REWARD_AMOUNT } },
          { new: true, session },
        );

        if (!rewardedReferrer) {
          throw new Error("REFERRER_NOT_FOUND");
        }

        await WalletTransaction.create(
          [
            {
              user: invitedUserId,
              type: "referral_bonus",
              amount: REFERRAL_REWARD_AMOUNT,
              currency: "RON",
              status: "completed",
              description: "Bonus invitație Nexora",
              metadata: {
                referralId: invitedUserId,
                role: "invited",
                referrerId,
                qualifyingOrderId: qualifyingOrder._id.toString(),
                rewardedAt: now,
              },
            },
            {
              user: referrerId,
              type: "referral_bonus",
              amount: REFERRAL_REWARD_AMOUNT,
              currency: "RON",
              status: "completed",
              description: "Bonus prieten invitat Nexora",
              metadata: {
                referralId: invitedUserId,
                role: "referrer",
                invitedUserId,
                qualifyingOrderId: qualifyingOrder._id.toString(),
                rewardedAt: now,
              },
            },
          ],
          { session },
        );

        reward = {
          invitedUserId,
          referrerId,
          qualifyingOrderId: qualifyingOrder._id.toString(),
        };
      });
    } finally {
      await session.endSession();
    }

    if (!reward) return false;

    const metadata = {
      route: "referrals",
      rewardAmount: REFERRAL_REWARD_AMOUNT,
      qualifyingOrderId: reward.qualifyingOrderId,
    };

    await Promise.allSettled([
      notificationService.create({
        user: reward.invitedUserId,
        actor: reward.referrerId,
        type: "system",
        title: "Bonus de invitație acordat",
        message:
          "Ai publicat două anunțuri și ai finalizat prima vânzare. Ai primit 100 RON în sold.",
        metadata,
      }),
      notificationService.create({
        user: reward.referrerId,
        actor: reward.invitedUserId,
        type: "system",
        title: "Bonus de invitație acordat",
        message:
          "Prietenul invitat a îndeplinit condițiile. Ai primit 100 RON în sold.",
        metadata,
      }),
    ]);

    return true;
  }
}

export const referralRewardService = new ReferralRewardService();
