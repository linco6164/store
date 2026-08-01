"use client";

import { useState } from "react";
import { SendHorizonal, Smile } from "lucide-react";

import { socket } from "../../lib/socket";
import { chatService } from "../../services/chat.service";

import { Message } from "../../types/chat";

import EmojiPicker from "./EmojiPicker";
import ImageUploader from "./ImageUploader";
import ReplyPreview from "./ReplyPreview";

interface MessageInputProps {
    conversationId: string;
    replyMessage: Message | null;
    disabled?: boolean;
    onCancelReply: () => void;
}

export default function MessageInput({
    conversationId,
    replyMessage,
    disabled = false,
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
        setMessage((prev) => prev + emoji);
    }

    async function sendMessage() {
        if (
            disabled ||
            !message.trim() &&
            images.length === 0
        ) {
            return;
        }

        let uploadedImages: string[] = [];

        if (images.length > 0) {
            uploadedImages =
                await chatService.uploadImages(
                    images,
                    "chat",
                    conversationId
                );
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
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <div className="border-t bg-white p-4">

            {replyMessage && (
                <div className="mb-3">
                    <ReplyPreview
                        message={replyMessage}
                        onCancel={
                            onCancelReply
                        }
                    />
                </div>
            )}

            {images.length > 0 && (
                <div className="mb-3">
                    <ImageUploader
                        images={images}
                        onChange={setImages}
                    />
                </div>
            )}

            <div
                className={`flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 ${
                    disabled
                        ? "pointer-events-none opacity-60"
                        : ""
                }`}
            >

                {/* Emoji */}

                <div className="relative flex-shrink-0">

                    <button
                        type="button"
                        onClick={() =>
                            setEmojiOpen(
                                (prev) => !prev
                            )
                        }
                        disabled={disabled}
                        className="rounded-lg p-2 transition hover:bg-gray-200"
                    >
                        <Smile size={22} />
                    </button>

                    <EmojiPicker
                        open={emojiOpen}
                        onClose={() =>
                            setEmojiOpen(
                                false
                            )
                        }
                        onEmojiSelect={
                            handleEmojiSelect
                        }
                    />

                </div>

                {/* Upload */}

                <div className="flex-shrink-0">
                    <ImageUploader
                        images={images}
                        onChange={setImages}
                    />
                </div>

                {/* Text */}

                <textarea
                    value={message}
                    disabled={disabled}
                    onChange={(e) => {
                        setMessage(
                            e.target.value
                        );

                        if (
                            e.target.value
                        ) {
                            handleTyping();
                        } else {
                            handleStopTyping();
                        }
                    }}
                    onKeyDown={
                        handleKeyDown
                    }
                    rows={1}
                    placeholder="Scrie un mesaj..."
                    style={{
                        resize: "none",
                    }}
                    className="min-h-[24px] max-h-40 flex-1 overflow-y-auto bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* Send */}

                <button
                    type="button"
                    onClick={sendMessage}
                    disabled={
                        disabled ||
                        !message.trim() &&
                        images.length === 0
                    }
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <SendHorizonal
                        size={20}
                    />
                </button>

            </div>

        </div>
    );
}
