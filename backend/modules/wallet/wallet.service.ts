import mongoose from "mongoose";

import User from "../../models/Users.js";
import WalletTransaction from "./wallet.model.js";
import Order from "../order/order.model.js";
import { ListingModel } from "../listing/listing.model.js";

class WalletService {
  async getWallet(userId: string) {
    const user = await User.findById(userId).select("balance");

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return {
      balance: user.balance ?? 0,
      currency: "RON",
    };
  }

  async getTransactions(userId: string, limit = 50, skip = 0) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const safeSkip = Math.max(Number(skip) || 0, 0);

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({
        user: userId,
      })
        .populate("order", "amount status listing")
        .sort({
          createdAt: -1,
        })
        .skip(safeSkip)
        .limit(safeLimit)
        .lean(),

      WalletTransaction.countDocuments({
        user: userId,
      }),
    ]);

    return {
      transactions,
      total,
      limit: safeLimit,
      skip: safeSkip,
    };
  }

  async purchase(buyerId: string, listingId: string) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        const listing = await ListingModel.findOne({
          _id: listingId,
          status: "active",
        }).session(session);

        if (!listing) {
          throw new Error("LISTING_NOT_AVAILABLE");
        }

        const sellerId = listing.seller.toString();

        if (sellerId === buyerId) {
          throw new Error("CANNOT_BUY_OWN_LISTING");
        }

        const amount = Number(listing.price);

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("INVALID_LISTING_PRICE");
        }

        /*
         * Debitează soldul cumpărătorului
         * doar dacă are suficienți bani.
         */
        const buyer = await User.findOneAndUpdate(
          {
            _id: buyerId,
            balance: {
              $gte: amount,
            },
          },
          {
            $inc: {
              balance: -amount,
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!buyer) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        /*
         * Marcăm anunțul ca vândut.
         */
        const updatedListing = await ListingModel.findOneAndUpdate(
          {
            _id: listingId,
            status: "active",
          },
          {
            $set: {
              status: "sold",
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!updatedListing) {
          throw new Error("LISTING_ALREADY_SOLD");
        }

        /*
         * Creăm comanda.
         */
        const [order] = await Order.create(
          [
            {
              buyer: buyerId,
              seller: sellerId,
              listing: listingId,
              amount,
              currency: listing.currency ?? "RON",
              status: "paid",
            },
          ],
          {
            session,
          },
        );

        /*
         * Tranzacția cumpărătorului.
         */
        const [transaction] = await WalletTransaction.create(
          [
            {
              user: buyerId,
              type: "purchase",
              amount,
              currency: listing.currency ?? "RON",
              status: "completed",
              order: order._id,
              description: `Cumpărare: ${listing.title}`,
            },
          ],
          {
            session,
          },
        );

        result = {
          order,
          transaction,
          balance: buyer.balance,
        };
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async withdraw(
    userId: string,
    amount: number,
    iban: string,
    accountName: string,
  ) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    if (amount < 20) {
      throw new Error("MIN_WITHDRAWAL");
    }

    if (!iban || iban.trim().length < 15) {
      throw new Error("INVALID_IBAN");
    }

    if (!accountName || accountName.trim().length < 2) {
      throw new Error("INVALID_ACCOUNT_NAME");
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        balance: {
          $gte: amount,
        },
      },
      {
        $inc: {
          balance: -amount,
        },
      },
      {
        new: true,
      },
    );

    if (!user) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    try {
      const transaction = await WalletTransaction.create({
        user: userId,
        type: "withdrawal",
        amount,
        currency: "RON",
        status: "pending",
        description: `Retragere ${amount.toFixed(2)} RON`,
        withdrawal: {
          iban: iban.trim().toUpperCase(),
          accountName: accountName.trim(),
        },
      });

      return {
        transaction,
        balance: user.balance,
      };
    } catch (error) {
      // Dacă crearea tranzacției eșuează,
      // returnăm banii în sold.
      await User.findByIdAndUpdate(userId, {
        $inc: {
          balance: amount,
        },
      });

      throw error;
    }
  }
}

export const walletService = new WalletService();
