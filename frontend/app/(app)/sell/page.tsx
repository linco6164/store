"use client";

import { SellForm } from "@/app/components/Sell";
import Header from "../../components/Header";

import type { Metadata } from "next";

export default function SellPage() {
    return (
        <>

            <main className="min-h-screen bg-gray-50">

                <div className="mx-auto max-w-screen-2xl px-6 py-10">

                    <SellForm />

                </div>

            </main>
        </>
    );
}