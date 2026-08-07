"use client";

import {
    CalendarDays,
    MapPin,
    Eye,
} from "lucide-react";

interface Props {
    city: string;
    createdAt: string;
    views?: number;
}

export default function ProductLocation({
    city,
    createdAt,
    views = 0,
}: Props) {
    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-5">

            <h3 className="mb-5 text-lg font-bold">
                Listing Information
            </h3>

            <div className="space-y-4">

                <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">

                        <MapPin
                            size={20}
                            className="text-emerald-600"
                        />

                    </div>

                    <div>

                        <p className="text-xs uppercase text-gray-500">

                            Location

                        </p>

                        <p className="font-semibold">

                            {city}

                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">

                        <CalendarDays
                            size={20}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <p className="text-xs uppercase text-gray-500">

                            Posted

                        </p>

                        <p className="font-semibold">

                            {createdAt}

                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100">

                        <Eye
                            size={20}
                            className="text-violet-600"
                        />

                    </div>

                    <div>

                        <p className="text-xs uppercase text-gray-500">

                            Views

                        </p>

                        <p className="font-semibold">

                            {views.toLocaleString()}

                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}