"use client";

import {
    Heart,
    Package,
    ShoppingBag,
} from "lucide-react";

import {
    motion,
} from "framer-motion";

export type ProfileTab =
    | "listings"
    | "favorites"
    | "sold";

interface Props {
    active: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

const tabs: {
    id: ProfileTab;
    label: string;
    description: string;
    icon: typeof Package;
}[] = [
    {
        id: "listings",
        label: "Anunțurile mele",
        description: "Produsele publicate",
        icon: Package,
    },
    {
        id: "favorites",
        label: "Favorite",
        description: "Produsele salvate",
        icon: Heart,
    },
    {
        id: "sold",
        label: "Vândute",
        description: "Produsele vândute",
        icon: ShoppingBag,
    },
];

export default function ProfileTabs({
    active,
    onChange,
}: Props) {
    return (
        <div className="flex w-full gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                    active === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                            onChange(tab.id)
                        }
                        className="relative flex min-w-fit flex-1 items-center justify-center rounded-2xl px-4 py-3 transition-colors duration-200 sm:px-5"
                    >
                        {/* Active background */}

                        {isActive && (
                            <motion.div
                                layoutId="profile-tab"
                                className="absolute inset-0 rounded-2xl bg-gray-900"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}

                        {/* Content */}

                        <div
                            className={`relative z-10 flex items-center gap-2.5 ${
                                isActive
                                    ? "text-white"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <Icon
                                size={18}
                                strokeWidth={
                                    isActive
                                        ? 2.2
                                        : 2
                                }
                            />

                            <div className="text-left">
                                <p className="text-sm font-semibold">
                                    {tab.label}
                                </p>

                                <p
                                    className={`hidden text-[11px] sm:block ${
                                        isActive
                                            ? "text-gray-300"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {tab.description}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}