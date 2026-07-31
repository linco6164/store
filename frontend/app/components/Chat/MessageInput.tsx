"use client";

import { useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { socket } from "../../lib/socket";

import { Message } from "../../types/chat";

import { chatService } from "../../services/chat.service";

import ImageUploader from "./ImageUploader";
import ReplyPreview from "./ReplyPreview";

import EmojiPicker from "./EmojiPicker";
import { Smile } from "lucide-react";

interface MessageInputProps {
    conversationId: string;

    replyMessage: Message | null;

    onCancelReply: () => void;
}

export default function MessageInput({
    conversationId,
    replyMessage,
    onCancelReply,
}: MessageInputProps) {
    const [message, setMessage] = useState("");

    const [emojiOpen, setEmojiOpen] =
        useState(false);

    const [images, setImages] =
        useState<File[]>([]);

    function handleTyping() {
        socket.emit("typing", {
            conversationId,
        });
    }

    function handleStopTyping() {
        socket.emit("stopTyping", {
            conversationId,
        });
    }

    function handleEmojiSelect(
        emoji: string
    ) {
        setMessage(
            (prev) => prev + emoji
        );
    }

    async function sendMessage() {
        if (!message.trim() && images.length === 0) {
            return;
        }

        let uploadedImages: string[] = [];

        if (images.length > 0) {
            uploadedImages =
                await chatService.uploadImages(images);
        }

        socket.emit("sendMessage", {
            conversationId,
            text: message.trim(),
            images: uploadedImages,
        });

        setMessage("");
        setImages([]);
        onCancelReply();
        handleStopTyping();
    }

    function handleKeyDown(
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <div className="border-t bg-white p-4">
            <div className="flex items-end gap-3">

                <div className="relative">

                    <button
                        onClick={() =>
                            setEmojiOpen(
                                (prev) => !prev
                            )
                        }
                        className="rounded-lg p-2 transition hover:bg-gray-100"
                    >
                        <Smile size={22} />
                    </button>

                    <EmojiPicker
                        open={emojiOpen}
                        onClose={() =>
                            setEmojiOpen(false)
                        }
                        onEmojiSelect={
                            handleEmojiSelect
                        }
                    />

                </div>

                <ImageUploader
                    images={images}
                    onChange={setImages}
                />

                <ReplyPreview
                    message={replyMessage}
                    onCancel={onCancelReply}
                />

                <textarea
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);

                        if (e.target.value) {
                            handleTyping();
                        } else {
                            handleStopTyping();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <SendHorizonal size={20} />
                </button>

            </div>
        </div>
    );
}