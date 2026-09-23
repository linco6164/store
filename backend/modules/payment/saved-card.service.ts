import mongoose from "mongoose";
import { SavedCardModel } from "./saved-card.model.js";

interface CreateSavedCardPayload {
  provider: "netopia";
  providerReference: string;
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
}

class SavedCardService {
  async getSavedCards(userId: string) {
    return SavedCardModel.find({
      user: userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });
  }

  async createSavedCard(userId: string, payload: CreateSavedCardPayload) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("USER_NOT_FOUND");
    }

    const brand = String(payload.brand ?? "").trim();
    const last4 = String(payload.last4 ?? "").trim();
    const providerReference = String(payload.providerReference ?? "").trim();

    if (!brand) {
      throw new Error("CARD_BRAND_REQUIRED");
    }

    if (!/^\d{4}$/.test(last4)) {
      throw new Error("CARD_LAST4_INVALID");
    }

    if (!providerReference) {
      throw new Error("CARD_REFERENCE_REQUIRED");
    }

    if (
      payload.expMonth !== undefined &&
      (!Number.isInteger(payload.expMonth) ||
        payload.expMonth < 1 ||
        payload.expMonth > 12)
    ) {
      throw new Error("CARD_EXP_MONTH_INVALID");
    }

    if (
      payload.expYear !== undefined &&
      (!Number.isInteger(payload.expYear) || payload.expYear < 2000)
    ) {
      throw new Error("CARD_EXP_YEAR_INVALID");
    }

    const existing = await SavedCardModel.findOne({
      user: userId,
      provider: payload.provider,
      providerReference,
    });

    if (existing) {
      return existing;
    }

    const shouldBeDefault =
      payload.isDefault === true ||
      !(await SavedCardModel.exists({ user: userId }));

    if (shouldBeDefault) {
      await SavedCardModel.updateMany(
        { user: userId },
        { $set: { isDefault: false } },
      );
    }

    const cardData: {
      user: string;
      provider: "netopia";
      providerReference: string;
      brand: string;
      last4: string;
      expMonth?: number;
      expYear?: number;
      isDefault: boolean;
    } = {
      user: userId,
      provider: payload.provider,
      providerReference,
      brand,
      last4,
      isDefault: shouldBeDefault,
    };

    if (payload.expMonth !== undefined) {
      cardData.expMonth = payload.expMonth;
    }

    if (payload.expYear !== undefined) {
      cardData.expYear = payload.expYear;
    }

    return SavedCardModel.create(cardData);
  }

  async setDefaultCard(userId: string, cardId: string) {
    if (!mongoose.isValidObjectId(cardId)) {
      throw new Error("CARD_NOT_FOUND");
    }

    const card = await SavedCardModel.findOne({
      _id: cardId,
      user: userId,
    });

    if (!card) {
      throw new Error("CARD_NOT_FOUND");
    }

    await SavedCardModel.updateMany(
      { user: userId },
      { $set: { isDefault: false } },
    );

    card.isDefault = true;
    await card.save();

    return card;
  }

  async deleteSavedCard(userId: string, cardId: string) {
    if (!mongoose.isValidObjectId(cardId)) {
      throw new Error("CARD_NOT_FOUND");
    }

    const card = await SavedCardModel.findOne({
      _id: cardId,
      user: userId,
    });

    if (!card) {
      throw new Error("CARD_NOT_FOUND");
    }

    await SavedCardModel.deleteOne({
      _id: cardId,
      user: userId,
    });

    if (card.isDefault) {
      const nextCard = await SavedCardModel.findOne({
        user: userId,
      }).sort({
        createdAt: -1,
      });

      if (nextCard) {
        nextCard.isDefault = true;
        await nextCard.save();
      }
    }

    return true;
  }
}

export const savedCardService = new SavedCardService();
