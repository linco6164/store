import { Types } from "mongoose";

import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { ListingModel } from "../modules/listing/listing.model.js";
import {
    notificationService,
} from "../modules/notification/notification.service.js";

class ChatService {
    async startConversation(
        senderId: string,
        listingId: string
    ) {
        const listing = await ListingModel.findById(listingId);

        if (!listing) {
            throw new Error("Listing not found");
        }

        const receiverId = listing.seller.toString();

        if (receiverId === senderId) {
            throw new Error(
                "You cannot contact your own listing."
            );
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    new Types.ObjectId(senderId),
                    new Types.ObjectId(receiverId),
                ],
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
        })
            .populate(
                "participants",
                "_id username avatar"
            )
            .populate(
                "listing",
                "_id title price images"
            )
            .sort({
                updatedAt: -1,
            });
    }

    async getConversation(
        conversationId: string,
        userId: string
    ) {
        const conversation =
            await Conversation.findById(
                conversationId
            )
                .populate(
                    "participants",
                    "_id username avatar"
                )
                .populate(
                    "listing",
                    "_id title price images"
                );

        if (!conversation) {
            throw new Error(
                "Conversation not found"
            );
        }

        const isParticipant =
            conversation.participants.some(
                (participant: any) =>
                    participant._id.toString() ===
                    userId
            );

        if (!isParticipant) {
            throw new Error("Access denied");
        }

        return conversation;
    }

    async getConversationById(
        conversationId: string
    ) {
        return Conversation.findById(
            conversationId
        )
            .populate(
                "participants",
                "_id username avatar"
            )
            .populate(
                "listing",
                "_id title price images"
            )
            .lean();
    }

    async getMessages(
        conversationId: string,
        userId: string
    ) {
        await this.getConversation(conversationId, userId);

        return Message.find({
            conversation: conversationId,
        })
            .populate(
                "sender",
                "_id username avatar"
            )
            .populate({
                path: "replyTo",
                select: "text images sender",
                populate: {
                    path: "sender",
                    select: "_id username avatar",
                },
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
        replyTo?: string
    ) {
        const conversation =
            await Conversation.findById(
                conversationId
            );

        if (!conversation) {
            throw new Error(
                "Conversation not found"
            );
        }

        const isParticipant =
            conversation.participants.some(
                (participant) =>
                    participant.toString() ===
                    senderId
            );

        if (!isParticipant) {
            throw new Error(
                "Access denied"
            );
        }

        const message =
            await Message.create({
                conversation:
                    conversationId,
                sender: senderId,
                text,
                images,
                replyTo,
                deliveredTo: [senderId],
                seenBy: [senderId],
            });

        const unread =
            conversation.unread ||
            new Map();

        const recipients: string[] = [];

        conversation.participants.forEach(
            (participant: any) => {
                const id =
                    participant.toString();

                if (id !== senderId) {
                    unread.set(
                        id,
                        (unread.get(id) || 0) +
                        1
                    );

                    recipients.push(id);
                }
            }
        );

        conversation.lastMessage =
            text;

        conversation.lastMessageAt =
            new Date();

        conversation.unread =
            unread;

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
                await notificationService.create(
                    {
                        user: recipientId,
                        type: "message",
                        title: "Mesaj nou",
                        message:
                            text?.trim() ||
                            "Ai primit un mesaj nou.",
                        actor: senderId,
                        conversation:
                            conversationId,
                        listing:
                            conversation.listing
                                ? conversation.listing.toString()
                                : undefined,
                    }
                );
            } catch (notificationError) {
                console.error(
                    "Failed to create message notification:",
                    notificationError
                );
            }
        }

        return Message.findById(
            message._id
        )
            .populate(
                "sender",
                "_id username avatar"
            )
            .populate(
                "replyTo",
                "text images sender"
            );
    }

    async markAsDelivered(
        conversationId: string,
        userId: string
    ) {
        await Message.updateMany(
            {
                conversation:
                    conversationId,
                deliveredTo: {
                    $ne: userId,
                },
            },
            {
                $push: {
                    deliveredTo:
                        userId,
                },
            }
        );
    }

    async markAsSeen(
        conversationId: string,
        userId: string
    ) {
        await Message.updateMany(
            {
                conversation:
                    conversationId,
                seenBy: {
                    $ne: userId,
                },
            },
            {
                $push: {
                    seenBy: userId,
                },
            }
        );

        const conversation =
            await Conversation.findById(
                conversationId
            );

        if (
            conversation &&
            conversation.unread
        ) {
            conversation.unread.set(
                userId,
                0
            );

            await conversation.save();
        }
    }
}

export default new ChatService();
