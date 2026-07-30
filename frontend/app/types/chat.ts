export interface ChatUser {
    _id: string;
    username: string;
    avatar?: string;
}

export interface Message {
    _id: string;

    conversation: string;

    sender: ChatUser;

    text: string;

    images: string[];

    seenBy: string[];

    createdAt: string;

    updatedAt: string;
}

export interface Conversation {
    _id: string;

    participants: ChatUser[];

    listing?: {
        _id: string;
        title: string;
        images: string[];
        price: number;
    };

    lastMessage?: Message;

    lastMessageAt: string;

    createdAt: string;

    updatedAt: string;
}