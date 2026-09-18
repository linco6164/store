import { Types } from "mongoose";

import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { ListingModel } from "../modules/listing/listing.model.js";
import Offer from "../models/Offer.js";
import { notificationService } from "../modules/notification/notification.service.js";

class ChatService {
  async startConversation(senderId: string, listingId: string) {
    const listing = await ListingModel.findById(listingId);

    if (!listing) {
      throw new Error("Listing not found");
    }

    const receiverId = listing.seller.toString();

    if (receiverId === senderId) {
      throw new Error("You cannot contact your own listing.");
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [new Types.ObjectId(senderId), new Types.ObjectId(receiverId)],
      },
      listing: listing._id,
    });

    if (conversation) {
      return conversation;
    }

    conversation = await Conversation.create({
      participants: [
        new Types.ObjectId(senderId),
        new Types.ObjectId(receiverId),
      ],
      listing: listing._id,
      lastMessage: "",
      lastMessageAt: new Date(),
      unread: {},
    });

    return conversation;
  }

  async getConversations(userId: string) {
    return Conversation.find({
      participants: new Types.ObjectId(userId),
      deletedFor: {$ne: new Types.ObjectId(userId),}
    })
      .populate("participants", "_id username avatar")
      .populate("listing", "_id title price images")
      .sort({
        updatedAt: -1,
      });
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "_id username avatar")
      .populate("listing", "_id title price images");

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (participant: any) => participant._id.toString() === userId,
    );

    if (!isParticipant) {
      throw new Error("Access denied");
    }

    return conversation;
  }

  async getConversationById(conversationId: string) {
    return Conversation.findById(conversationId)
      .populate("participants", "_id username avatar")
      .populate("listing", "_id title price images")
      .lean();
  }

  async getMessages(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);

    return Message.find({
      conversation: conversationId,
      deletedFor: {$ne: new Types.ObjectId(userId),}
    })
      .populate("sender", "_id username avatar")
      .populate({
        path: "replyTo",
        select: "text images sender",
        populate: {
          path: "sender",
          select: "_id username avatar",
        },
      })
      .populate({
        path: "offer",
        populate: [
          {
            path: "buyer",
            select: "_id username avatar",
          },
          {
            path: "seller",
            select: "_id username avatar",
          },
          {
            path: "listing",
            select: "_id title price images currency",
          },
        ],
      })
      .sort({
        createdAt: 1,
      });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    images: string[] = [],
    replyTo?: string,
  ) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === senderId,
    );

    if (!isParticipant) {
      throw new Error("Access denied");
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
      images,
      replyTo,
      deliveredTo: [senderId],
      seenBy: [senderId],
    });

    const unread = conversation.unread || new Map();

    const recipients: string[] = [];

    conversation.participants.forEach((participant: any) => {
      const id = participant.toString();

      if (id !== senderId) {
        unread.set(id, (unread.get(id) || 0) + 1);

        recipients.push(id);
      }
    });

    conversation.lastMessage = text;

    conversation.lastMessageAt = new Date();

    conversation.unread = unread;

    await conversation.save();

    /*
     * Trimitem notificarea după ce
     * mesajul și conversația au fost
     * salvate cu succes.
     *
     * Dacă notificarea eșuează,
     * mesajul rămâne valid.
     */
    for (const recipientId of recipients) {
      try {
        await notificationService.create({
          user: recipientId,
          type: "message",
          title: "Mesaj nou",
          message: text?.trim() || "Ai primit un mesaj nou.",
          actor: senderId,
          conversation: conversationId,
          listing: conversation.listing
            ? conversation.listing.toString()
            : undefined,
        });
      } catch (notificationError) {
        console.error(
          "Failed to create message notification:",
          notificationError,
        );
      }
    }

    return Message.findById(message._id)
      .populate("sender", "_id username avatar")
      .populate("replyTo", "text images sender");
  }

  async markAsDelivered(conversationId: string, userId: string) {
    await Message.updateMany(
      {
        conversation: conversationId,
        deliveredTo: {
          $ne: userId,
        },
      },
      {
        $push: {
          deliveredTo: userId,
        },
      },
    );
  }

  async sendOffer(conversationId: string, senderId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("INVALID_OFFER_AMOUNT");
    }

    const conversation =
      await Conversation.findById(conversationId).populate("listing");

    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === senderId,
    );

    if (!isParticipant) {
      throw new Error("ACCESS_DENIED");
    }

    const listing: any = conversation.listing;

    if (!listing) {
      throw new Error("LISTING_NOT_FOUND");
    }

    if (listing.status !== "active") {
      throw new Error("LISTING_NOT_AVAILABLE");
    }

    const sellerId = listing.seller.toString();

    if (sellerId === senderId) {
      throw new Error("SELLER_CANNOT_MAKE_BUYER_OFFER");
    }

    if (amount >= Number(listing.price)) {
      throw new Error("OFFER_MUST_BE_BELOW_LISTING_PRICE");
    }

    await Offer.updateMany(
      {
        conversation: conversationId,
        buyer: senderId,
        status: "pending",
      },
      {
        $set: {
          status: "cancelled",
        },
      },
    );

    const offer = await Offer.create({
      conversation: conversationId,
      listing: listing._id,
      buyer: senderId,
      seller: sellerId,
      amount,
      currency: listing.currency ?? "RON",
      status: "pending",
    });

    const unread = conversation.unread || new Map();

    conversation.participants.forEach((participant: any) => {
      const id = participant.toString();

      if (id !== senderId) {
        unread.set(id, (unread.get(id) || 0) + 1);
      }
    });

    conversation.lastMessage = `Ofertă: ${amount.toFixed(2)} ${listing.currency ?? "RON"}`;

    conversation.lastMessageAt = new Date();
    conversation.unread = unread;

    await conversation.save();

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text: "",
      images: [],
      type: "offer",
      offer: offer._id,
      deliveredTo: [senderId],
      seenBy: [senderId],
    });

    return Message.findById(message._id)
      .populate("sender", "_id username avatar")
      .populate({
        path: "offer",
        populate: [
          {
            path: "buyer",
            select: "_id username avatar",
          },
          {
            path: "seller",
            select: "_id username avatar",
          },
          {
            path: "listing",
            select: "_id title price images currency",
          },
        ],
      });
  }

  async acceptOffer(offerId: string, userId: string) {
    const offer = await Offer.findById(offerId);

    if (!offer) {
      throw new Error("OFFER_NOT_FOUND");
    }

    if (offer.seller.toString() !== userId) {
      throw new Error("ONLY_SELLER_CAN_ACCEPT");
    }

    if (offer.status !== "pending") {
      throw new Error("OFFER_NOT_PENDING");
    }

    const listing = await ListingModel.findOne({
      _id: offer.listing,
      status: "active",
    });

    if (!listing) {
      throw new Error("LISTING_NOT_AVAILABLE");
    }

    offer.status = "accepted";

    await offer.save();

    return offer;
  }

  async rejectOffer(offerId: string, userId: string) {
    const offer = await Offer.findById(offerId);

    if (!offer) {
      throw new Error("OFFER_NOT_FOUND");
    }

    if (offer.seller.toString() !== userId) {
      throw new Error("ONLY_SELLER_CAN_REJECT");
    }

    if (offer.status !== "pending") {
      throw new Error("OFFER_NOT_PENDING");
    }

    offer.status = "rejected";

    await offer.save();

    return offer;
  }

  async markAsSeen(conversationId: string, userId: string) {
    await Message.updateMany(
      {
        conversation: conversationId,
        seenBy: {
          $ne: userId,
        },
      },
      {
        $push: {
          seenBy: userId,
        },
      },
    );

    const conversation = await Conversation.findById(conversationId);

    if (conversation && conversation.unread) {
      conversation.unread.set(userId, 0);

      await conversation.save();
    }
  }

  async deleteMessage(
    messageId: string,
    userId: string,
    mode: "me" | "everyone",
  ) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new Error("INVALID_MESSAGE_ID");
    }

    if (mode !== "me" && mode !== "everyone") {
      throw new Error("INVALID_DELETE_MODE");
    }

    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("MESSAGE_NOT_FOUND");
    }

    const conversation = await Conversation.findById(message.conversation);

    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId,
    );

    if (!isParticipant) {
      throw new Error("ACCESS_DENIED");
    }

    /*
     * Ștergere doar pentru mine
     */
    if (mode === "me") {
      await Message.updateOne(
        {
          _id: messageId,
        },
        {
          $addToSet: {
            deletedFor: new Types.ObjectId(userId),
          },
        },
      );

      return {
        mode: "me",
        messageId,
      };
    }

    /*
     * Ștergere pentru toți:
     * doar autorul mesajului poate face asta.
     */
    if (message.sender.toString() !== userId) {
      throw new Error("ONLY_SENDER_CAN_DELETE_FOR_EVERYONE");
    }

    /*
     * Deocamdată nu permitem ștergerea
     * mesajelor de tip ofertă.
     */
    if (message.type === "offer") {
      throw new Error("OFFER_CANNOT_BE_DELETED");
    }

    message.isDeleted = true;
    message.deletedAt = new Date();

    message.text = "";
    message.images = [];

    await message.save();

    return {
      mode: "everyone",
      messageId,
    };
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
) {
    if (!Types.ObjectId.isValid(conversationId)) {
        throw new Error("INVALID_CONVERSATION_ID");
    }

    const conversation =
        await Conversation.findById(
            conversationId,
        );

    if (!conversation) {
        throw new Error(
            "CONVERSATION_NOT_FOUND",
        );
    }

    const isParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() === userId,
        );

    if (!isParticipant) {
        throw new Error("ACCESS_DENIED");
    }

    await Conversation.updateOne(
        {
            _id: conversationId,
        },
        {
            $addToSet: {
                deletedFor:
                    new Types.ObjectId(userId),
            },
        },
    );

    return {
        conversationId,
    };
}
}

export default new ChatService();
