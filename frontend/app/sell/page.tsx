"use client";

import { SellForm } from "@/app/components/Sell";

export default function SellPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">

            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">

                <SellForm />

            </div>

        </main>
    );
}