import { Types } from "mongoose";

import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

class ChatService {
    async startConversation(
        senderId: string,
        receiverId: string,
        listingId?: string
    ) {
        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    new Types.ObjectId(senderId),
                    new Types.ObjectId(receiverId),
                ],
            },
            ...(listingId && {
                listing: new Types.ObjectId(listingId),
            }),
        });

        if (conversation) {
            return conversation;
        }

        conversation = await Conversation.create({
            participants: [
                new Types.ObjectId(senderId),
                new Types.ObjectId(receiverId),
            ],
            listing: listingId
                ? new Types.ObjectId(listingId)
                : undefined,
            lastMessage: "",
        });

        return conversation;
    }

    async getConversations(userId: string) {
        return Conversation.find({
            participants: new Types.ObjectId(userId),
        })
            .populate("participants", "username avatar")
            .populate("listing", "title price images")
            .sort({
                updatedAt: -1,
            });
    }

    async getConversation(
        conversationId: string,
        userId: string
    ) {
        const conversation = await Conversation.findById(
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
            throw new Error("Conversation not found");
        }

        const isParticipant =
            conversation.participants.some(
                (participant: any) =>
                    participant._id.toString() === userId
            );

        if (!isParticipant) {
            throw new Error("Access denied");
        }

        return conversation;
    }

    async getMessages(conversationId: string) {
        return Message.find({
            conversation: conversationId,
        })
            .populate("sender", "username avatar")
            .sort({
                createdAt: 1,
            });
    }

    async sendMessage(
        conversationId: string,
        senderId: string,
        text: string,
        images: string[] = []
    ) {
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
            images,
            seenBy: [senderId],
        });

        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                lastMessage: text,
                lastMessageAt: new Date(),
            }
        );

        return Message.findById(message._id)
            .populate("sender", "username avatar");
    }

    async markAsSeen(
        conversationId: string,
        userId: string
    ) {
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
            }
        );
    }
}

export default new ChatService();