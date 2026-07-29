"use client";

interface Props {
    stats: {
        listings: number;
        sold: number;
        favorites: number;
    };
}

export default function ProfileStats({
    stats,
}: Props) {
    const items = [
        {
            label: "Anunțuri",
            value: stats.listings,
        },
        {
            label: "Vândute",
            value: stats.sold,
        },
        {
            label: "Favorite",
            value: stats.favorites,
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        p-6
                        shadow-sm
                        transition
                        hover:shadow-md
                    "
                >
                    <h3 className="text-3xl font-bold">
                        {item.value}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        {item.label}
                    </p>
                </div>
            ))}
        </section>
    );
}