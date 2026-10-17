import User from "../../models/Users.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { ListingModel } from "../listing/listing.model.js";
import { ReviewModel } from "../review/review.model.js";
import {
  REFERRAL_REQUIRED_COMPLETED_SALES,
  REFERRAL_REQUIRED_LISTINGS,
  REFERRAL_REWARD_AMOUNT,
  referralRewardService,
} from "./referral-reward.service.js";

class ProfileService {
  private async ensureReferralCode(userId: string) {
    const user = await User.findById(userId).select("referralCode");

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `NX${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
      const existing = await User.exists({ referralCode: code });
      if (existing) continue;

      const updated = await User.findOneAndUpdate(
        {
          _id: userId,
          $or: [
            { referralCode: { $exists: false } },
            { referralCode: null },
            { referralCode: "" },
          ],
        },
        { $set: { referralCode: code } },
        { new: true },
      ).select("referralCode");

      if (updated?.referralCode) {
        return updated.referralCode;
      }

      const current = await User.findById(userId).select("referralCode");
      if (current?.referralCode) return current.referralCode;
    }

    throw new Error("REFERRAL_CODE_GENERATION_FAILED");
  }

  async getReferralInfo(userId: string) {
    try {
      await referralRewardService.evaluate(userId);
    } catch (error) {
      console.error("REFERRAL REWARD EVALUATION ERROR:", error);
    }

    const code = await this.ensureReferralCode(userId);
    const invitedUsers = await User.find({ referredBy: userId })
      .select(
        "username avatar createdAt referralAcceptedAt referralRewardGrantedAt",
      )
      .sort({ referralAcceptedAt: -1, createdAt: -1 })
      .limit(20)
      .lean();

    const [myProgress, invitedProgress] = await Promise.all([
      referralRewardService.getProgress(userId),
      Promise.all(
        invitedUsers.map((user) =>
          referralRewardService.getProgress(user._id.toString()),
        ),
      ),
    ]);

    const publicAppUrl = (
      process.env.PUBLIC_APP_URL ||
      process.env.CLIENT_URL ||
      "https://nx-store.com"
    )
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");

    return {
      code,
      inviteUrl: `${publicAppUrl}/register?ref=${encodeURIComponent(code)}`,
      totalInvited: await User.countDocuments({ referredBy: userId }),
      program: {
        rewardAmount: REFERRAL_REWARD_AMOUNT,
        listingsRequired: REFERRAL_REQUIRED_LISTINGS,
        completedSalesRequired: REFERRAL_REQUIRED_COMPLETED_SALES,
        currency: "RON",
      },
      myProgress,
      recentInvites: invitedUsers.map((user, index) => ({
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        joinedAt: user.referralAcceptedAt ?? user.createdAt,
        progress: invitedProgress[index],
      })),
    };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select(
      "-password -emailVerificationCode -emailVerificationExpires -emailChangeCode -emailChangeExpires",
    );

    if (!user) {
      throw new Error("User not found");
    }

    const listings = await ListingModel.find({
      seller: userId,
    })
      .sort({
        createdAt: -1,
      })
      .populate("seller", "username avatar");

    const soldListings = listings.filter(
      (listing) => listing.status === "sold",
    );

    const reviewStats = await ReviewModel.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          average: { $avg: "$rating" },
        },
      },
    ]);

    const reviews = reviewStats[0]?.count ?? 0;
    const rating = reviewStats[0]?.average ?? 0;

    return {
      user,

      stats: {
        listings: listings.length,
        sold: soldListings.length,
        reviews,
        rating,
        favorites: 0,
      },

      listings,
    };
  }

  async getPublicProfile(userId: string) {
    const user = await User.findById(userId).select(
      "username fullName avatar bio city country createdAt",
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const reviewStats = await ReviewModel.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          average: { $avg: "$rating" },
        },
      },
    ]);

    const reviews = reviewStats[0]?.count ?? 0;
    const rating = reviewStats[0]?.average ?? 0;

    const [listings, sold] = await Promise.all([
      ListingModel.find({
        seller: userId,
        status: "active",
      })
        .sort({
          createdAt: -1,
        })
        .populate("seller", "username avatar"),

      ListingModel.countDocuments({
        seller: userId,
        status: "sold",
      }),
    ]);

    return {
      user,

      stats: {
        listings: listings.length,
        sold,
        reviews,
        rating,
        favorites: 0,
      },

      listings,
    };
  }

  async updateProfile(userId: string, payload: Record<string, unknown>) {
    const allowedFields = [
      "username",
      "fullName",
      "phone",
      "bio",
      "avatar",
      "country",
      "city",
      "county",
      "postalCode",
      "instagram",
      "facebook",
      "website",
    ] as const;

    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => typeof payload[field] === "string")
        .map((field) => [field, payload[field]]),
    );

    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: {
          $ne: userId,
        },
      });

      if (existingUser) {
        throw new Error("USERNAME_TAKEN");
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return this.getProfile(userId);
  }

  async getNotificationSettings(userId: string) {
    const user = await User.findById(userId).select("notificationSettings");

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user.notificationSettings;
  }

  async updateNotificationSettings(
    userId: string,
    payload: Record<string, unknown>,
  ) {
    const allowedFields = [
      "push",
      "messages",
      "favorites",
      "offers",
      "account",
      "sound",
      "vibration",
    ] as const;

    const updates: Record<string, boolean> = {};

    for (const field of allowedFields) {
      if (typeof payload[field] === "boolean") {
        updates[`notificationSettings.${field}`] = payload[field] as boolean;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("notificationSettings");

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user.notificationSettings;
  }
}

export const profileService = new ProfileService();
