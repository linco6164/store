"use client";

import SocialLinks from "./SocialLinks";

export default function FooterBottom() {
    return (
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t pt-8 lg:flex-row">

            <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Nexora. All rights reserved.
            </p>

            <SocialLinks />

            <div className="flex gap-3 text-sm text-gray-500">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Apple Pay</span>
                <span>Google Pay</span>
            </div>

        </div>
    );
}