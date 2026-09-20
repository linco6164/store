import mongoose from "mongoose";

const StoreUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationCode: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    emailChangePending: {
      type: String,
      default: null,
    },

    emailChangeCode: {
      type: String,
      default: null,
    },

    emailChangeExpires: {
      type: Date,
      default: null,
    },

    password: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: [
        "user",
        "admin",
        "support_agent",
        "support_manager",
        "it_agent",
        "finance_agent",
        "logistics_agent",
        "moderator",
      ],
      default: "user",
    },

    department: {
      type: String,
      enum: [
        "general",
        "call_center",
        "it",
        "payments",
        "orders",
        "logistics",
        "moderation",
        "account_security",
        "admin",
      ],
      default: "general",
    },

    provider: {
      type: String,
      enum: ["credentials", "google", "facebook", "discord"],
      default: "credentials",
    },

    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    discordId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },

    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerificationCode: {
      type: String,
      default: null,
    },

    phoneVerificationExpires: {
      type: Date,
      default: null,
    },

    phoneChangePending: {
      type: String,
      default: null,
    },

    phoneChangeCode: {
      type: String,
      default: null,
    },

    phoneChangeExpires: {
      type: Date,
      default: null,
    },

    bio: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    county: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    website: { type: String, default: "" },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    notificationSettings: {
      push: {
        type: Boolean,
        default: true,
      },
      messages: {
        type: Boolean,
        default: true,
      },
      favorites: {
        type: Boolean,
        default: true,
      },
      offers: {
        type: Boolean,
        default: true,
      },
      account: {
        type: Boolean,
        default: true,
      },
      sound: {
        type: Boolean,
        default: true,
      },
      vibration: {
        type: Boolean,
        default: true,
      },
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
    },

    banned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: null,
    },

    twoFactorRecoveryCodes: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Store", StoreUserSchema, "store");
