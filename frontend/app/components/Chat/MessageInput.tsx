"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";

import { socket } from "../../lib/socket";

import { chatService } from "../../services/chat.service";

interface MessageInputProps {
    conversationId: string;
}

export default function MessageInput({
    conversationId,
}: MessageInputProps) {
    const [message, setMessage] = useState("");

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

    async function sendMessage() {
        if (!message.trim()) return;

        socket.emit("sendMessage", {
            conversationId,
            text: message.trim(),
            images: [],
        });

        setMessage("");
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