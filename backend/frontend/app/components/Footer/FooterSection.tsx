"use client";

import Link from "next/link";

interface FooterSectionProps {
    title: string;
    links: {
        label: string;
        href: string;
    }[];
}

export default function FooterSection({
    title,
    links,
}: FooterSectionProps) {
    return (
        <div>
            <h3 className="mb-5 font-semibold text-gray-900">
                {title}
            </h3>

            <ul className="space-y-3">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}