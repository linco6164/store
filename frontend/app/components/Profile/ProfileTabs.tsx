"use client";

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
}[] = [
    {
        id: "listings",
        label: "Anunțurile mele",
    },
    {
        id: "favorites",
        label: "Favorite",
    },
    {
        id: "sold",
        label: "Vândute",
    },
];

export default function ProfileTabs({
    active,
    onChange,
}: Props) {
    return (
        <div className="flex flex-wrap gap-3 border-b pb-4">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        rounded-xl
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        transition

                        ${
                            active === tab.id
                                ? "bg-black text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                        }
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}