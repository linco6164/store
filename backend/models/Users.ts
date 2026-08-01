import mongoose from 'mongoose';

const StoreUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: null
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
  bio: { type: String, default: "" },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  county: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  instagram: { type: String, default: "" },
  facebook: { type: String, default: "" },
  website: { type: String, default: "" },

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

  twoFactorRecoveryCodes: [
    {
      type: String,
    },
  ],
}, {
  timestamps: true
});

export default mongoose.model("Store", StoreUserSchema, "store");
