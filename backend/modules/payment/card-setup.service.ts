import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/Users.js";
import CardSetupModel from "./card-setup.model.js";
import { netopiaService, DecryptedNotification } from "./netopia.service.js";
import { savedCardService } from "./saved-card.service.js";

type CardSetupPlatform = "android" | "web";

interface CreateCardSetupInput {
  userId: string;
  platform: CardSetupPlatform;
  returnUrl: string;
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function allowedWebOrigins(): Set<string> {
  const configured = [
    process.env.CLIENT_URL,
    ...(process.env.CARD_SETUP_WEB_ORIGINS ?? "").split(","),
  ];

  return new Set(
    configured
      .map((value) => normalizeOrigin(String(value ?? "").trim()))
      .filter((value): value is string => Boolean(value)),
  );
}

function validateReturnUrl(platform: CardSetupPlatform, rawUrl: string): string {
  const value = rawUrl.trim();

  if (platform === "android") {
    const url = new URL(value);

    if (
      url.protocol !== "nexora:" ||
      url.hostname !== "cards" ||
      url.pathname !== "/setup-return"
    ) {
      throw new Error("CARD_SETUP_RETURN_URL_INVALID");
    }

    return url.toString();
  }

  const url = new URL(value);
  const allowedOrigins = allowedWebOrigins();

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    !allowedOrigins.has(url.origin.toLowerCase())
  ) {
    throw new Error("CARD_SETUP_RETURN_URL_INVALID");
  }

  return url.toString();
}

function splitName(fullName: string, username: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return {
      firstName: parts[0] || username || "Nexora",
      lastName: username || "User",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function cardMetadata(notification: DecryptedNotification) {
  const tokenId = String(notification.tokenId ?? "").trim();
  const panMasked = String(notification.panMasked ?? "")
    .replace(/\s/g, "")
    .trim();
  const panMatch = panMasked.match(/^(\d{6})\*+(\d{4})$/);

  if (!tokenId || !panMatch) {
    throw new Error("CARD_SETUP_TOKEN_MISSING");
  }

  const bin = panMatch[1];
  const last4 = panMatch[2];
  const firstSix = Number(bin);
  let brand = "Card";

  if (bin.startsWith("4")) {
    brand = "Visa";
  } else if (
    (firstSix >= 510000 && firstSix <= 559999) ||
    (firstSix >= 222100 && firstSix <= 272099)
  ) {
    brand = "Mastercard";
  } else if (bin.startsWith("34") || bin.startsWith("37")) {
    brand = "American Express";
  }

  const expiration = String(notification.tokenExpirationDate ?? "");
  const expirationMatch = expiration.match(/^(\d{4})-(\d{2})/);
  const expYear = expirationMatch ? Number(expirationMatch[1]) : undefined;
  const expMonth = expirationMatch ? Number(expirationMatch[2]) : undefined;

  return {
    tokenId,
    panMasked,
    last4,
    brand,
    expMonth,
    expYear,
    paymentInstrumentId: notification.paymentInstrumentId,
  };
}

class CardSetupService {
  async createSetup(input: CreateCardSetupInput) {
    if (!mongoose.isValidObjectId(input.userId)) {
      throw new Error("USER_NOT_FOUND");
    }

    const userExists = await User.exists({ _id: input.userId });

    if (!userExists) {
      throw new Error("USER_NOT_FOUND");
    }

    const returnUrl = validateReturnUrl(input.platform, input.returnUrl);
    const providerOrderId = `NX-CARD-${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    return CardSetupModel.create({
      user: input.userId,
      providerOrderId,
      platform: input.platform,
      returnUrl,
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async getCheckout(setupId: string, apiBaseUrl: string) {
    if (!mongoose.isValidObjectId(setupId)) {
      throw new Error("CARD_SETUP_NOT_FOUND");
    }

    const setup = await CardSetupModel.findById(setupId);

    if (!setup || setup.expiresAt.getTime() <= Date.now()) {
      throw new Error("CARD_SETUP_NOT_FOUND");
    }

    if (setup.status !== "pending") {
      throw new Error("CARD_SETUP_ALREADY_FINISHED");
    }

    const user = await User.findById(setup.user).select(
      "email fullName username phone city county postalCode country",
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const username = String(user.username ?? "User");
    const fullName = String(user.fullName ?? username);
    const { firstName, lastName } = splitName(fullName, username);

    return netopiaService.createCheckoutEnvelope({
      orderId: setup.providerOrderId,
      amount: 0,
      currency: "RON",
      details: "Verificare card Nexora",
      customerId: setup.user.toString(),
      oneClick: true,
      confirmUrl: `${apiBaseUrl}/payments/cards/setup/confirm`,
      returnUrl:
        `${apiBaseUrl}/payments/cards/setup/return` +
        `?setupId=${encodeURIComponent(setup._id.toString())}`,
      billing: {
        email: String(user.email ?? ""),
        firstName,
        lastName,
        phone: user.phone ? String(user.phone) : undefined,
        city: user.city ? String(user.city) : undefined,
        county: user.county ? String(user.county) : undefined,
        postalCode: user.postalCode ? String(user.postalCode) : undefined,
        country: user.country ? String(user.country) : "RO",
      },
    });
  }

  async handleNotification(input: {
    envKey: string;
    data: string;
    cipher?: string;
    iv?: string;
  }) {
    const notification = netopiaService.decryptNotification(input);
    const setup = await CardSetupModel.findOne({
      providerOrderId: notification.orderId,
    });

    if (!setup) {
      throw new Error("CARD_SETUP_NOT_FOUND");
    }

    if (setup.status === "completed") {
      return setup;
    }

    if (notification.errorCode !== 0) {
      setup.status = "failed";
      setup.errorCode = notification.errorCode;
      setup.errorMessage = notification.errorMessage ?? "Card respins";
      await setup.save();
      return setup;
    }

    const metadata = cardMetadata(notification);
    const card = await savedCardService.createSavedCard(setup.user.toString(), {
      provider: "netopia",
      providerReference: metadata.tokenId,
      panMasked: metadata.panMasked,
      paymentInstrumentId: metadata.paymentInstrumentId,
      brand: metadata.brand,
      last4: metadata.last4,
      expMonth: metadata.expMonth,
      expYear: metadata.expYear,
    });

    setup.status = "completed";
    setup.savedCard = card._id as mongoose.Types.ObjectId;
    setup.errorCode = 0;
    setup.errorMessage = null;
    await setup.save();

    return setup;
  }

  async getSetup(setupId: string) {
    if (!mongoose.isValidObjectId(setupId)) {
      throw new Error("CARD_SETUP_NOT_FOUND");
    }

    const setup = await CardSetupModel.findById(setupId);

    if (!setup) {
      throw new Error("CARD_SETUP_NOT_FOUND");
    }

    return setup;
  }
}

export const cardSetupService = new CardSetupService();
