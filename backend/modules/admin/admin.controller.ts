import { Request, Response } from "express";
import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js"; // ← corectat: ListingModel, nu Listing
import Conversation from "../../models/Conversation.js"; // ← default export, fără acolade

import { NotificationCampaign } from "../notification/notification-campaign.model.js";

import bcrypt from "bcrypt"; // sau bcrypt, orice ai deja folosit în auth.ts
import crypto from "crypto";

import { notificationService } from "../notification/notification.service.js";
import { pushNotificationService } from "../notification/push-notification.service.js";

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
        .sort({ updatedAt: -1 })
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

  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password, fullName, phone, role, department } =
        req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email și parola sunt obligatorii.",
        });
      }

      if (typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username-ul trebuie să aibă cel puțin 3 caractere.",
        });
      }

      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email invalid.",
        });
      }

      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Parola trebuie să aibă cel puțin 6 caractere.",
        });
      }

      const allowedRoles = [
        "user",
        "admin",
        "support_agent",
        "support_manager",
        "it_agent",
        "finance_agent",
        "logistics_agent",
        "moderator",
      ];

      const allowedDepartments = [
        "general",
        "call_center",
        "it",
        "payments",
        "orders",
        "logistics",
        "moderation",
        "account_security",
        "admin",
      ];

      const selectedRole = role || "user";
      const selectedDepartment = department || "general";

      if (!allowedRoles.includes(selectedRole)) {
        return res.status(400).json({
          success: false,
          message: "Rol invalid.",
        });
      }

      if (!allowedDepartments.includes(selectedDepartment)) {
        return res.status(400).json({
          success: false,
          message: "Departament invalid.",
        });
      }

      const normalizedUsername = username.trim();
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
      });

      if (existingUser) {
        if (existingUser.email === normalizedEmail) {
          return res.status(409).json({
            success: false,
            message: "Acest email este deja folosit.",
          });
        }

        return res.status(409).json({
          success: false,
          message: "Acest username este deja folosit.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,

        fullName: typeof fullName === "string" ? fullName.trim() : "",

        phone: typeof phone === "string" ? phone.trim() : "",

        role: selectedRole,
        department: selectedDepartment,

        provider: "credentials",

        banned: false,
        banReason: null,

        balance: 0,

        twoFactorEnabled: false,
      });

      const safeUser = await User.findById(user._id).select(
        "-password -twoFactorSecret -twoFactorRecoveryCodes",
      );

      return res.status(201).json({
        success: true,
        message: "Utilizatorul a fost creat cu succes.",
        data: safeUser,
      });
    } catch (error) {
      console.error("CREATE USER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Eroare la crearea utilizatorului.",
      });
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
      console.log("========== TOGGLE BAN ==========");
      console.log("USER ID:", req.params.id);

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User negăsit",
        });
      }

      const { reason } = req.body;

      console.log("REASON:", reason);

      user.banned = !user.banned;

      if (user.banned) {
        if (!reason || typeof reason !== "string" || !reason.trim()) {
          return res.status(400).json({
            success: false,
            message: "Trebuie selectat un motiv pentru blocare.",
          });
        }

        user.banReason = reason.trim();
      } else {
        user.banReason = null;
      }

      await user.save();

      console.log("BANNED:", user.banned);
      console.log("BAN REASON:", user.banReason);

      if (user.banned) {
        try {
          const result = await pushNotificationService.sendToUser(
            user._id.toString(),
            {
              title: "Cont blocat",
              body: "Contul tău a fost blocat de administrator.",
              data: {
                type: "account_banned",
                reason: user.banReason ?? "",
              },
            },
          );

          console.log("FCM RESULT:", result);
        } catch (fcmError) {
          console.error("FCM SEND ERROR:", fcmError);
        }
      }

      console.log("========== END TOGGLE BAN ==========");

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("TOGGLE BAN ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Eroare la actualizarea statusului",
      });
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

      const seller = req.query.seller as string | undefined;
      const status = req.query.status as string | undefined;

      const query: Record<string, unknown> = {};

      if (seller) {
        query.seller = seller;
      }

      if (status) {
        query.status = status;
      }

      const listings = await ListingModel.find(query)
        .populate("seller", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await ListingModel.countDocuments(query);

      return res.json({
        success: true,
        data: listings,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("GET LISTINGS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Eroare la încărcarea anunțurilor",
      });
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
    let campaign: any = null;

    try {
      const {
        title,
        body,
        imageUrl,
        priority = "normal",
        route,
        targetId,
        url,
      } = req.body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Titlul este obligatoriu",
        });
      }

      if (!body || typeof body !== "string" || !body.trim()) {
        return res.status(400).json({
          success: false,
          message: "Mesajul este obligatoriu",
        });
      }

      if (priority !== "normal" && priority !== "high") {
        return res.status(400).json({
          success: false,
          message: "Prioritate invalidă",
        });
      }

      /*
       * 1. Salvăm notificarea înainte de trimitere.
       */
      campaign = await NotificationCampaign.create({
        title: title.trim(),

        body: body.trim(),

        imageUrl:
          typeof imageUrl === "string" && imageUrl.trim()
            ? imageUrl.trim()
            : null,

        audience: "all",

        priority,

        status: "processing",

        data: {
          type: "promotion",

          ...(route
            ? {
                route,
              }
            : {}),

          ...(targetId
            ? {
                targetId,
              }
            : {}),

          ...(url
            ? {
                url,
              }
            : {}),
        },

        timezone: "Europe/Bucharest",
      });

      /*
       * 2. Trimitem notificarea prin sistemul existent.
       */
      await notificationService.sendBroadcastNotification({
        title: title.trim(),

        body: body.trim(),

        data: {
          type: "promotion",

          ...(route
            ? {
                route,
              }
            : {}),

          ...(targetId
            ? {
                targetId,
              }
            : {}),

          ...(url
            ? {
                url,
              }
            : {}),
        },
      });

      /*
       * 3. Marcăm notificarea ca trimisă.
       */
      campaign.status = "sent";
      campaign.sentAt = new Date();

      await campaign.save();

      return res.json({
        success: true,

        message: "Notificare trimisă",

        notification: {
          id: campaign._id,

          title: campaign.title,

          body: campaign.body,

          status: campaign.status,

          sentAt: campaign.sentAt,
        },
      });
    } catch (error) {
      console.error("SEND BROADCAST ERROR:", error);

      /*
       * Dacă notificarea fusese deja creată,
       * o marcăm ca failed.
       */
      if (campaign) {
        try {
          campaign.status = "failed";

          await campaign.save();
        } catch (saveError) {
          console.error("FAILED TO UPDATE CAMPAIGN:", saveError);
        }
      }

      return res.status(500).json({
        success: false,
        message: "Eroare la trimiterea notificării",
      });
    }
  },

  async createNotification(req: Request, res: Response) {
    try {
      const {
        title,
        body,

        imageUrl,

        audience = "all",

        priority = "normal",

        status = "draft",

        scheduledAt,

        expiresAt,

        timezone = "Europe/Bucharest",

        route,
        targetId,
        url,
      } = req.body;

      /*
       * Validare titlu
       */
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Titlul este obligatoriu",
        });
      }

      /*
       * Validare mesaj
       */
      if (!body || typeof body !== "string" || !body.trim()) {
        return res.status(400).json({
          success: false,
          message: "Mesajul este obligatoriu",
        });
      }

      /*
       * Status permis la creare:
       * draft sau scheduled
       */
      if (status !== "draft" && status !== "scheduled") {
        return res.status(400).json({
          success: false,
          message: "Statusul trebuie să fie draft sau scheduled",
        });
      }

      /*
       * Prioritate
       */
      if (priority !== "normal" && priority !== "high") {
        return res.status(400).json({
          success: false,
          message: "Prioritate invalidă",
        });
      }

      const allowedAudiences = [
        "all",
        "buyers",
        "sellers",
        "verified",
        "custom",
      ];

      if (!allowedAudiences.includes(audience)) {
        return res.status(400).json({
          success: false,
          message: "Audiență invalidă",
        });
      }

      /*
       * Programarea este obligatorie
       * dacă status = scheduled
       */
      let scheduledDate: Date | null = null;

      if (status === "scheduled") {
        if (!scheduledAt) {
          return res.status(400).json({
            success: false,
            message: "Data programării este obligatorie",
          });
        }

        scheduledDate = new Date(scheduledAt);

        if (Number.isNaN(scheduledDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Data programării este invalidă",
          });
        }

        if (scheduledDate.getTime() <= Date.now()) {
          return res.status(400).json({
            success: false,
            message: "Notificarea trebuie programată în viitor",
          });
        }
      }

      /*
       * Expirare opțională
       */
      let expirationDate: Date | null = null;

      if (expiresAt) {
        expirationDate = new Date(expiresAt);

        if (Number.isNaN(expirationDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Data expirării este invalidă",
          });
        }

        if (
          scheduledDate &&
          expirationDate.getTime() <= scheduledDate.getTime()
        ) {
          return res.status(400).json({
            success: false,
            message: "Expirarea trebuie să fie după data programării",
          });
        }
      }

      /*
       * Creăm notificarea.
       * NU o trimitem încă.
       */
      const notification = await NotificationCampaign.create({
        title: title.trim(),

        body: body.trim(),

        imageUrl:
          typeof imageUrl === "string" && imageUrl.trim()
            ? imageUrl.trim()
            : null,

        audience,

        priority,

        status,

        scheduledAt: status === "scheduled" ? scheduledDate : null,

        expiresAt: expirationDate,

        timezone,

        data: {
          type: "promotion",

          ...(route
            ? {
                route,
              }
            : {}),

          ...(targetId
            ? {
                targetId,
              }
            : {}),

          ...(url
            ? {
                url,
              }
            : {}),
        },
      });

      return res.status(201).json({
        success: true,

        message:
          status === "scheduled"
            ? "Notificarea a fost programată"
            : "Draft salvat",

        notification,
      });
    } catch (error) {
      console.error("CREATE NOTIFICATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut salva notificarea",
      });
    }
  },

  async getNotifications(req: Request, res: Response) {
    try {
      const { status, search, page = "1", limit = "20" } = req.query;

      const pageNumber = Math.max(1, Number(page) || 1);

      const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));

      const skip = (pageNumber - 1) * limitNumber;

      const filter: Record<string, any> = {};

      /*
       * Filtrare după status.
       */
      if (
        typeof status === "string" &&
        [
          "draft",
          "scheduled",
          "processing",
          "sent",
          "failed",
          "cancelled",
        ].includes(status)
      ) {
        filter.status = status;
      }

      /*
       * Search după titlu sau mesaj.
       */
      if (typeof search === "string" && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");

        filter.$or = [
          {
            title: searchRegex,
          },
          {
            body: searchRegex,
          },
        ];
      }

      const [notifications, total, statusStats] = await Promise.all([
        NotificationCampaign.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        NotificationCampaign.countDocuments(filter),

        NotificationCampaign.aggregate([
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },
        ]),
      ]);

      const stats = {
        all: 0,
        draft: 0,
        scheduled: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        cancelled: 0,
      };

      for (const item of statusStats) {
        const statusName = item._id as keyof typeof stats;

        if (statusName && statusName in stats) {
          stats[statusName] = item.count;
        }

        stats.all += item.count;
      }

      const totalPages = Math.max(1, Math.ceil(total / limitNumber));

      return res.json({
        success: true,

        notifications,

        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages,
          hasNext: pageNumber < totalPages,
          hasPrevious: pageNumber > 1,
        },

        stats,
      });
    } catch (error) {
      console.error("GET NOTIFICATIONS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-au putut încărca notificările",
      });
    }
  },

  async getNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const notification = await NotificationCampaign.findById(id).lean();

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notificarea nu a fost găsită",
        });
      }

      return res.json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error("GET NOTIFICATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut încărca notificarea",
      });
    }
  },

  async updateNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const notification = await NotificationCampaign.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notificarea nu a fost găsită",
        });
      }

      /*
       * Nu modificăm o notificare care este
       * deja trimisă sau în curs de trimitere.
       */
      if (
        notification.status === "sent" ||
        notification.status === "processing"
      ) {
        return res.status(409).json({
          success: false,
          message: "Notificarea nu mai poate fi modificată",
        });
      }

      const {
        title,
        body,
        imageUrl,
        audience,
        priority,
        status,
        scheduledAt,
        expiresAt,
        timezone,
        route,
        targetId,
        url,
      } = req.body;

      if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
          return res.status(400).json({
            success: false,
            message: "Titlu invalid",
          });
        }

        notification.title = title.trim();
      }

      if (body !== undefined) {
        if (typeof body !== "string" || !body.trim()) {
          return res.status(400).json({
            success: false,
            message: "Mesaj invalid",
          });
        }

        notification.body = body.trim();
      }

      if (imageUrl !== undefined) {
        notification.imageUrl =
          typeof imageUrl === "string" && imageUrl.trim()
            ? imageUrl.trim()
            : null;
      }

      if (priority !== undefined) {
        if (!["normal", "high"].includes(priority)) {
          return res.status(400).json({
            success: false,
            message: "Prioritate invalidă",
          });
        }

        notification.priority = priority;
      }

      if (audience !== undefined) {
        const allowedAudiences = [
          "all",
          "buyers",
          "sellers",
          "verified",
          "custom",
        ];

        if (!allowedAudiences.includes(audience)) {
          return res.status(400).json({
            success: false,
            message: "Audiență invalidă",
          });
        }

        notification.audience = audience;
      }

      if (timezone !== undefined) {
        notification.timezone = timezone || "Europe/Bucharest";
      }

      /*
       * Draft sau Scheduled.
       */
      if (status !== undefined) {
        if (!["draft", "scheduled"].includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Status invalid pentru editare",
          });
        }

        notification.status = status;
      }

      /*
       * Dacă vrem programare,
       * scheduledAt trebuie să existe
       * și să fie în viitor.
       */
      if (
        status === "scheduled" ||
        (notification.status === "scheduled" && scheduledAt !== undefined)
      ) {
        if (!scheduledAt) {
          return res.status(400).json({
            success: false,
            message: "Data programării este obligatorie",
          });
        }

        const scheduledDate = new Date(scheduledAt);

        if (Number.isNaN(scheduledDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Data programării este invalidă",
          });
        }

        if (scheduledDate.getTime() <= Date.now()) {
          return res.status(400).json({
            success: false,
            message: "Data programării trebuie să fie în viitor",
          });
        }

        notification.scheduledAt = scheduledDate;
      }

      if (status === "draft") {
        notification.scheduledAt = null;
      }

      if (expiresAt !== undefined) {
        if (!expiresAt) {
          notification.expiresAt = null;
        } else {
          const expirationDate = new Date(expiresAt);

          if (Number.isNaN(expirationDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: "Data expirării este invalidă",
            });
          }

          if (
            notification.scheduledAt &&
            expirationDate.getTime() <= notification.scheduledAt.getTime()
          ) {
            return res.status(400).json({
              success: false,
              message: "Expirarea trebuie să fie după programare",
            });
          }

          notification.expiresAt = expirationDate;
        }
      }

      notification.data = {
        type: notification.data?.type || "promotion",

        ...(route
          ? {
              route,
            }
          : {}),

        ...(targetId
          ? {
              targetId,
            }
          : {}),

        ...(url
          ? {
              url,
            }
          : {}),
      };

      await notification.save();

      return res.json({
        success: true,
        message:
          notification.status === "scheduled"
            ? "Notificarea a fost programată"
            : "Notificarea a fost actualizată",

        notification,
      });
    } catch (error) {
      console.error("UPDATE NOTIFICATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut actualiza notificarea",
      });
    }
  },

  async sendNotificationNow(req: Request, res: Response) {
    try {
      const { id } = req.params;

      /*
       * Rezervare atomică.
       * Evită două trimiteri simultane.
       */
      const notification = await NotificationCampaign.findOneAndUpdate(
        {
          _id: id,

          status: {
            $in: ["draft", "scheduled", "failed"],
          },
        },

        {
          $set: {
            status: "processing",
          },
        },

        {
          new: true,
        },
      );

      if (!notification) {
        return res.status(409).json({
          success: false,
          message: "Notificarea nu poate fi trimisă în starea actuală",
        });
      }

      try {
        await notificationService.sendBroadcastNotification({
          title: notification.title,

          body: notification.body,

          data: {
            type: notification.data?.type || "promotion",

            ...(notification.data?.route
              ? {
                  route: notification.data.route,
                }
              : {}),

            ...(notification.data?.targetId
              ? {
                  targetId: notification.data.targetId,
                }
              : {}),

            ...(notification.data?.url
              ? {
                  url: notification.data.url,
                }
              : {}),
          },
        });

        notification.status = "sent";

        notification.sentAt = new Date();

        notification.scheduledAt = null;

        await notification.save();

        return res.json({
          success: true,
          message: "Notificarea a fost trimisă",
          notification,
        });
      } catch (error) {
        notification.status = "failed";

        await notification.save();

        throw error;
      }
    } catch (error) {
      console.error("SEND NOTIFICATION NOW ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut trimite notificarea",
      });
    }
  },

  async cancelNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const notification = await NotificationCampaign.findOneAndUpdate(
        {
          _id: id,
          status: "scheduled",
        },

        {
          $set: {
            status: "cancelled",
          },
        },

        {
          new: true,
        },
      );

      if (!notification) {
        return res.status(409).json({
          success: false,
          message: "Doar notificările programate pot fi anulate",
        });
      }

      return res.json({
        success: true,
        message: "Programarea a fost anulată",
        notification,
      });
    } catch (error) {
      console.error("CANCEL NOTIFICATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut anula notificarea",
      });
    }
  },

  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const notification = await NotificationCampaign.findOneAndDelete({
        _id: id,

        status: {
          $in: ["draft", "cancelled", "failed"],
        },
      });

      if (!notification) {
        return res.status(409).json({
          success: false,
          message: "Notificarea nu poate fi ștearsă în starea actuală",
        });
      }

      return res.json({
        success: true,
        message: "Notificarea a fost ștearsă",
      });
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut șterge notificarea",
      });
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
      const {
        username,
        fullName,
        phone,
        bio,
        country,
        city,
        county,
        postalCode,
        instagram,
        facebook,
        website,
      } = req.body;

      const updateData: Record<string, unknown> = {};

      if (username !== undefined) {
        updateData.username = String(username).trim();
      }

      if (fullName !== undefined) {
        updateData.fullName = String(fullName).trim();
      }

      if (phone !== undefined) {
        updateData.phone = String(phone).trim();
      }

      if (bio !== undefined) {
        updateData.bio = String(bio).trim();
      }

      if (country !== undefined) {
        updateData.country = String(country).trim();
      }

      if (city !== undefined) {
        updateData.city = String(city).trim();
      }

      if (county !== undefined) {
        updateData.county = String(county).trim();
      }

      if (postalCode !== undefined) {
        updateData.postalCode = String(postalCode).trim();
      }

      if (instagram !== undefined) {
        updateData.instagram = String(instagram).trim();
      }

      if (facebook !== undefined) {
        updateData.facebook = String(facebook).trim();
      }

      if (website !== undefined) {
        updateData.website = String(website).trim();
      }

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password -twoFactorSecret -twoFactorRecoveryCodes");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User negăsit",
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("UPDATE USER PROFILE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Eroare la actualizarea profilului",
      });
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
