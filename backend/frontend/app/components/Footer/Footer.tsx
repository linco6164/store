"use client";

import Image from "next/image";

import FooterBottom from "./FooterBottom";
import FooterSection from "./FooterSection";
import { footerData } from "./footer.data";

export default function Footer() {
    return (
        <footer className="mt-24 border-t bg-white">

            <div className="mx-auto max-w-7xl px-6 py-16">

                <div className="mb-14">

                    <Image
                        src="/nexora2.png"
                        alt="Nexora"
                        width={170}
                        height={45}
                    />

                    <p className="mt-5 max-w-md text-gray-500">
                        Buy and sell fashion, electronics and more.
                        Safe payments, verified members and fast shipping.
                    </p>

                </div>

                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

                    <FooterSection {...footerData.company} />

                    <FooterSection {...footerData.support} />

                    <FooterSection {...footerData.legal} />

                </div>

                <FooterBottom />

            </div>

        </footer>
    );
}