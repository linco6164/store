"use client";

import { Conversation } from "../../types/chat";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

interface ChatLayoutProps {
    conversations: Conversation[];
    activeConversation?: Conversation;
}

export default function ChatLayout({
    conversations,
    activeConversation,
}: ChatLayoutProps) {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-xl border bg-white shadow-sm">

            {/* Sidebar */}

            <aside className="hidden w-[360px] border-r lg:flex">
                <ConversationList
                    conversations={conversations}
                    activeConversationId={
                        activeConversation?._id
                    }
                />
            </aside>

            {/* Mobile */}

            {!activeConversation && (
                <div className="flex flex-1 lg:hidden">
                    <ConversationList
                        conversations={conversations}
                    />
                </div>
            )}

            {/* Chat */}

            {activeConversation ? (
                <main className="flex flex-1 flex-col">
                    <ChatWindow
                        conversation={activeConversation}
                    />
                </main>
            ) : (
                <main className="hidden flex-1 items-center justify-center bg-gray-50 lg:flex">

                    <div className="text-center">

                        <div className="mb-4 text-7xl">
                            💬
                        </div>

                        <h2 className="text-2xl font-semibold">
                            Selectează o conversație
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Alege o conversație din
                            lista din stânga pentru
                            a începe să vorbești.
                        </p>

                    </div>

                </main>
            )}

        </div>
    );
}