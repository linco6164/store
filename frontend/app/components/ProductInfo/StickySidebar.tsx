"use client";

import { Flag } from "lucide-react";

import ProductPrice from "./ProductPrice";
import SellerCard from "./SellerCard";
import ProductLocation from "./ProductLocation";
import ProductActions from "./ProductActions";

interface Props {
    listingId: string;

    price: number;
    city: string;
    createdAt: string;

    seller: {
        _id: string;
        username: string;
        avatar?: string;
    };
}

export default function StickySidebar({
    listingId,
    price,
    city,
    createdAt,
    seller,
}: Props) {
    return (
        <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <ProductPrice
                    price={price}
                />

                <div className="mt-6">
                    <ProductActions
                        listingId={listingId}
                    />
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <SellerCard
                        seller={seller}
                    />
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <ProductLocation
                        city={city}
                        createdAt={createdAt}
                    />
                </div>

                <button
                    type="button"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                >
                    <Flag size={18} />

                    Report listing
                </button>
            </div>
        </aside>
    );
}