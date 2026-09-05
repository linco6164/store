"use client";

import {
    Heart,
    Package,
    ShoppingBag,
    ArrowUpRight,
} from "lucide-react";

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
            description: "Produse active",
            value: stats.listings,
            icon: Package,
            iconClass:
                "bg-blue-50 text-blue-600",
        },
        {
            label: "Vândute",
            description: "Tranzacții finalizate",
            value: stats.sold,
            icon: ShoppingBag,
            iconClass:
                "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Favorite",
            description: "Produse salvate",
            value: stats.favorites,
            icon: Heart,
            iconClass:
                "bg-red-50 text-red-500",
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.label}
                        className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-6"
                    >
                        {/* Decorative background */}

                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-50 transition-transform duration-300 group-hover:scale-125" />

                        <div className="relative">
                            <div className="flex items-start justify-between">
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconClass}`}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={2}
                                    />
                                </div>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition-colors group-hover:bg-gray-100 group-hover:text-gray-600">
                                    <ArrowUpRight
                                        size={17}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-3xl font-bold tracking-tight text-gray-950">
                                    {item.value}
                                </p>

                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {item.label}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}