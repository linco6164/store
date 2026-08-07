"use client";

import { Heart, Flag, MessageCircle } from "lucide-react";

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
    favorite?: boolean;
}

export default function StickySidebar({
    price,
    city,
    createdAt,
    seller,
    favorite = false,
    listingId,
}: Props) {
    return (
        <aside className="sticky top-24">

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <ProductPrice
                    price={price}
                />

                <div className="space-y-3">

                   <ProductActions
                        favorite={favorite}
                        listingId={listingId}
                    />

                </div>

                <SellerCard
                    seller={seller}
                />

                <ProductLocation
                    city={city}
                    createdAt={
                        createdAt
                    }
                />

                <button
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-red-600"
                >

                    <Flag
                        size={18}
                    />

                    Report listing

                </button>

            </div>

        </aside>
    );
}