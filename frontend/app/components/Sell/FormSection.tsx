"use client";

import { ReactNode } from "react";

interface FormSectionProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
}

export default function FormSection({
    title,
    description,
    icon,
    children,
}: FormSectionProps) {
    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-start gap-4">

                {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        {icon}
                    </div>
                )}

                <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-2 text-gray-500">
                            {description}
                        </p>
                    )}

                </div>

            </div>

            {children}

        </section>
    );
}