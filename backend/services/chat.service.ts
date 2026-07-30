import { Types } from "mongoose";

import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { ListingModel } from "../modules/listing/listing.model.js";

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
            throw new Error("You cannot contact your own listing.");
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
        console.log(
            Conversation.schema.path("participants")?.options
        );

        console.log(
            Message.schema.path("sender")?.options
        );

        console.log("1");

        const conversation = await Conversation.findById(
            conversationId
        );

        console.log("2");

        const populated = await conversation
            ?.populate("participants", "_id username avatar");

        console.log("3");

        await populated?.populate(
            "listing",
            "_id title price images"
        );

        console.log("4");

        if (!populated) {
            throw new Error("Conversation not found");
        }

        const isParticipant = populated.participants.some(
            (participant: any) =>
                participant._id.toString() === userId
        );

        if (!isParticipant) {
            throw new Error("Access denied");
        }

        return populated;
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