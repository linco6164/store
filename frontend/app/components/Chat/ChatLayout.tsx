"use client";

import { ReactNode } from "react";

interface ChatLayoutProps {
    sidebar: ReactNode;
    children: ReactNode;
}

export default function ChatLayout({
    sidebar,
    children,
}: ChatLayoutProps) {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-xl border bg-white shadow-sm">

            {/* Sidebar */}
            <aside className="hidden w-96 border-r lg:block">
                {sidebar}
            </aside>

            {/* Mobile */}
            <aside className="w-full lg:hidden">
                {sidebar}
            </aside>

            {/* Chat */}
            <main className="hidden flex-1 lg:block">
                {children}
            </main>

        </div>
    );
}