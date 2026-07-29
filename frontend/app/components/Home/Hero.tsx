"use client";

import Link from "next/link";
import HeroSearch from "./HeroSearch";

export default function Hero() {
    return (
        <section className="border-b bg-gradient-to-b from-emerald-50 to-white">
            <div className="mx-auto max-w-7xl px-6 py-16 text-center">

                <h1 className="text-5xl font-bold tracking-tight">
                    Cumpără și vinde ușor pe Nexora
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
                    Descoperă mii de produse de la utilizatori din toată România.
                </p>

                <HeroSearch />

                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href="/sell"
                        className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
                    >
                        Vinde acum
                    </Link>

                    <Link
                        href="/catalog"
                        className="rounded-xl border px-6 py-3 font-semibold transition hover:bg-gray-100"
                    >
                        Explorează
                    </Link>
                </div>

            </div>
        </section>
    );
}