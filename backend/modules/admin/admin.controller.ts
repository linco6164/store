import { Request, Response } from "express";
import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js"; // ← corectat: ListingModel, nu Listing
import Conversation from "../../models/Conversation.js"; // ← default export, fără acolade

import bcrypt from "bcrypt"; // sau bcrypt, orice ai deja folosit în auth.ts
import crypto from "crypto";

import { notificationService } from "../notification/notification.service.js";

import WalletTransaction from "../wallet/wallet.model.js"; // ← default export, fără acolade

export const adminController = {
  async getStats(req: Request, res: Response) {
    try {
      const [totalUsers, totalListings, activeListings, totalConversations] =
        await Promise.all([
          User.countDocuments(),
          ListingModel.countDocuments(),
          ListingModel.countDocuments({ status: "active" }),
          Conversation.countDocuments(),
        ]);

      res.json({
        success: true,
        data: { totalUsers, totalListings, activeListings, totalConversations },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Eroare la încărcarea statisticilor",
      });
    }
  },

  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || "";

      const query = search
        ? {
            $or: [
              { username: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
            ],
          }
        : {};

      const users = await User.find(query)
        .select("-password -twoFactorSecret")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: users,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la încărcarea userilor" });
    }
  },

  async updateUserRole(req: Request, res: Response) {
    try {
      const { role } = req.body;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ success: false, message: "Rol invalid" });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true },
      );
      res.json({ success: true, data: user });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la actualizarea rolului" });
    }
  },

  async toggleBanUser(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User negăsit" });

      user.banned = !user.banned;
      await user.save();

      res.json({ success: true, data: user });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la actualizarea statusului" });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "User șters" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la ștergerea userului" });
    }
  },

  async getAllListings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const listings = await ListingModel.find()
        .populate("seller", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await ListingModel.countDocuments();

      res.json({
        success: true,
        data: listings,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la încărcarea anunțurilor" });
    }
  },

  async deleteListing(req: Request, res: Response) {
    try {
      await ListingModel.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Anunț șters" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la ștergerea anunțului" });
    }
  },

  async sendBroadcast(req: Request, res: Response) {
    try {
      const { title, body } = req.body;
      if (!title || !body) {
        return res
          .status(400)
          .json({ success: false, message: "Titlu și mesaj obligatorii" });
      }

      await notificationService.sendBroadcastNotification({
        title,
        body,
        data: { type: "promotion" },
      });
      res.json({ success: true, message: "Notificare trimisă" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la trimiterea notificării" });
    }
  },

  async getUserDetails(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id).select(
        "-password -twoFactorSecret -twoFactorRecoveryCodes",
      );
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User negăsit" });
      res.json({ success: true, data: user });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la încărcarea userului" });
    }
  },

  async resetUserPassword(req: Request, res: Response) {
    try {
      const { newPassword } = req.body;

      const passwordToSet =
        newPassword || crypto.randomBytes(6).toString("hex");
      const hashedPassword = await bcrypt.hash(passwordToSet, 10);

      await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });

      res.json({
        success: true,
        message: "Parolă resetată",
        temporaryPassword: newPassword ? undefined : passwordToSet, // o arătăm doar dacă a fost generată automat
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la resetarea parolei" });
    }
  },

  async updateUserEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const existing = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Emailul este deja folosit de alt cont",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { email },
        { new: true },
      );
      res.json({ success: true, data: user });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la actualizarea emailului" });
    }
  },

  async disableUserTwoFactor(req: Request, res: Response) {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
      });
      res.json({ success: true, message: "2FA dezactivat pentru acest cont" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la dezactivarea 2FA" });
    }
  },

  async updateUserProfile(req: Request, res: Response) {
    try {
      const { username, fullName, phone } = req.body;

      const updateData: Record<string, unknown> = {};
      if (username !== undefined) updateData.username = username;
      if (fullName !== undefined) updateData.fullName = fullName;
      if (phone !== undefined) updateData.phone = phone;

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });
      res.json({ success: true, data: user });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Eroare la actualizarea profilului" });
    }
  },

  async getWithdrawals(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;

      const limit = parseInt(req.query.limit as string) || 20;

      const status = (req.query.status as string) || "pending";

      const query: Record<string, unknown> = {
        type: "withdrawal",
      };

      if (["pending", "completed", "rejected", "failed"].includes(status)) {
        query.status = status;
      }

      const withdrawals = await WalletTransaction.find(query)
        .populate("user", "username email fullName")
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await WalletTransaction.countDocuments(query);

      return res.json({
        success: true,
        data: withdrawals,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Eroare la încărcarea retragerilor",
      });
    }
  },

  async approveWithdrawal(req: Request, res: Response) {
    try {
      const withdrawal = await WalletTransaction.findOneAndUpdate(
        {
          _id: req.params.id,
          type: "withdrawal",
          status: "pending",
        },
        {
          $set: {
            status: "completed",
          },
        },
        {
          new: true,
        },
      ).populate("user", "username email fullName");

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: "Retragerea nu există sau a fost deja procesată.",
        });
      }

      return res.json({
        success: true,
        message: "Retragerea a fost aprobată.",
        data: withdrawal,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Eroare la aprobarea retragerii",
      });
    }
  },

  async rejectWithdrawal(req: Request, res: Response) {
    try {
      const withdrawal = await WalletTransaction.findOneAndUpdate(
        {
          _id: req.params.id,
          type: "withdrawal",
          status: "pending",
        },
        {
          $set: {
            status: "rejected",
          },
        },
        {
          new: true,
        },
      );

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: "Retragerea nu există sau a fost deja procesată.",
        });
      }

      await User.findByIdAndUpdate(withdrawal.user, {
        $inc: {
          balance: withdrawal.amount,
        },
      });

      return res.json({
        success: true,
        message:
          "Retragerea a fost respinsă iar suma a fost returnată în sold.",
        data: withdrawal,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Eroare la respingerea retragerii",
      });
    }
  },
};
