import mongoose, {
  Document,
  Schema,
} from "mongoose";

export type NotificationCampaignStatus =
  | "draft"
  | "scheduled"
  | "processing"
  | "sent"
  | "cancelled"
  | "failed";

export type NotificationCampaignPriority =
  | "normal"
  | "high";

export type NotificationCampaignAudience =
  | "all"
  | "buyers"
  | "sellers"
  | "verified"
  | "custom";

export interface INotificationCampaign extends Document {
  title: string;
  body: string;

  imageUrl?: string | null;

  audience: NotificationCampaignAudience;

  data: {
    type?: string;
    route?: string;
    targetId?: string;
    url?: string;
  };

  status: NotificationCampaignStatus;

  priority: NotificationCampaignPriority;

  scheduledAt?: Date | null;
  sentAt?: Date | null;
  expiresAt?: Date | null;

  timezone: string;

  stats: {
    targeted: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };

  createdBy?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const notificationCampaignSchema =
  new Schema<INotificationCampaign>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },

      imageUrl: {
        type: String,
        default: null,
      },

      audience: {
        type: String,
        enum: [
          "all",
          "buyers",
          "sellers",
          "verified",
          "custom",
        ],
        default: "all",
        index: true,
      },

      data: {
        type: {
          type: String,
          default: "promotion",
        },

        route: {
          type: String,
        },

        targetId: {
          type: String,
        },

        url: {
          type: String,
        },
      },

      status: {
        type: String,
        enum: [
          "draft",
          "scheduled",
          "processing",
          "sent",
          "cancelled",
          "failed",
        ],
        default: "draft",
        index: true,
      },

      priority: {
        type: String,
        enum: [
          "normal",
          "high",
        ],
        default: "normal",
      },

      scheduledAt: {
        type: Date,
        default: null,
        index: true,
      },

      sentAt: {
        type: Date,
        default: null,
      },

      expiresAt: {
        type: Date,
        default: null,
      },

      timezone: {
        type: String,
        default: "Europe/Bucharest",
      },

      stats: {
        targeted: {
          type: Number,
          default: 0,
        },

        sent: {
          type: Number,
          default: 0,
        },

        delivered: {
          type: Number,
          default: 0,
        },

        opened: {
          type: Number,
          default: 0,
        },

        clicked: {
          type: Number,
          default: 0,
        },

        failed: {
          type: Number,
          default: 0,
        },
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

notificationCampaignSchema.index({
  status: 1,
  scheduledAt: 1,
});

export const NotificationCampaign =
  mongoose.models.NotificationCampaign ||
  mongoose.model<INotificationCampaign>(
    "NotificationCampaign",
    notificationCampaignSchema,
  );