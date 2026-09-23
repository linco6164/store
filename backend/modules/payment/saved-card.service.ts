import mongoose from "mongoose";
import { SavedCardModel } from "./saved-card.model.js";

function validateObjectId(
  id: string,
  message: string,
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
}

export async function getSavedCards(
  userId: string,
) {
  validateObjectId(
    userId,
    "ID utilizator invalid.",
  );

  return SavedCardModel.find({
    user: userId,
  })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .select(
      "-providerReference",
    );
}

export async function setDefaultCard(
  userId: string,
  cardId: string,
) {
  validateObjectId(
    userId,
    "ID utilizator invalid.",
  );

  validateObjectId(
    cardId,
    "ID card invalid.",
  );

  const card = await SavedCardModel.findOne({
    _id: cardId,
    user: userId,
  });

  if (!card) {
    throw new Error(
      "Cardul nu există sau nu îți aparține.",
    );
  }

  await SavedCardModel.updateMany(
    {
      user: userId,
    },
    {
      $set: {
        isDefault: false,
      },
    },
  );

  card.isDefault = true;

  await card.save();

  return card;
}

export async function deleteSavedCard(
  userId: string,
  cardId: string,
) {
  validateObjectId(
    userId,
    "ID utilizator invalid.",
  );

  validateObjectId(
    cardId,
    "ID card invalid.",
  );

  const card =
    await SavedCardModel.findOneAndDelete({
      _id: cardId,
      user: userId,
    });

  if (!card) {
    throw new Error(
      "Cardul nu există sau nu îți aparține.",
    );
  }

  // Dacă ștergem cardul implicit,
  // alegem automat cel mai recent card rămas.
  if (card.isDefault) {
    const nextCard =
      await SavedCardModel.findOne({
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