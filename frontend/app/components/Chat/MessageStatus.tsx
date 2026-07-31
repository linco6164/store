"use client";

import {
    Check,
    CheckCheck,
    Clock3,
    Eye,
} from "lucide-react";

interface Props {
    status?:
        | "sending"
        | "sent"
        | "delivered"
        | "seen";
}

export default function MessageStatus({
    status = "sent",
}: Props) {
    switch (status) {
        case "sending":
            return (
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock3 size={12} />
                    <span>Sending...</span>
                </div>
            );

        case "sent":
            return (
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Check size={13} />
                    <span>Sent</span>
                </div>
            );

        case "delivered":
            return (
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <CheckCheck size={13} />
                    <span>Delivered</span>
                </div>
            );

        case "seen":
            return (
                <div className="flex items-center gap-1 text-[11px] text-blue-500">
                    <Eye size={13} />
                    <span>Seen</span>
                </div>
            );

        default:
            return null;
    }
}