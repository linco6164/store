"use client";

interface DateSeparatorProps {
    date: string | Date;
}

export default function DateSeparator({
    date,
}: DateSeparatorProps) {
    const text = formatDate(date);

    return (
        <div className="my-6 flex items-center gap-4">

            <div className="h-px flex-1 bg-gray-200" />

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                {text}
            </span>

            <div className="h-px flex-1 bg-gray-200" />

        </div>
    );
}

function formatDate(value: string | Date) {
    const date = new Date(value);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Astăzi";
    }

    if (
        date.toDateString() ===
        yesterday.toDateString()
    ) {
        return "Ieri";
    }

    return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year:
            date.getFullYear() !==
            today.getFullYear()
                ? "numeric"
                : undefined,
    });
}