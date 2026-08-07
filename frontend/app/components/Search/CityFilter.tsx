"use client";

import { MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const cities = [
    "Bucharest",
    "Cluj-Napoca",
    "Iași",
    "Timișoara",
    "Constanța",
    "Brașov",
    "Craiova",
    "Galați",
    "Oradea",
    "Sibiu",
    "Ploiești",
    "Arad",
    "Bacău",
    "Pitești",
    "Suceava",
];

export default function CityFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [focused, setFocused] =
        useState(false);

    const city =
        searchParams.get("city") ?? "";

    const filteredCities = useMemo(() => {
        if (!city) return cities;

        return cities.filter((item) =>
            item
                .toLowerCase()
                .includes(city.toLowerCase())
        );
    }, [city]);

    function update(value: string) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value) {
            params.set("city", value);
        } else {
            params.delete("city");
        }

        router.replace(
            `?${params.toString()}`,
            {
                scroll: false,
            }
        );
    }

    return (
        <div className="relative">

            <label className="mb-2 block text-sm font-medium text-gray-600">
                City
            </label>

            <div className="relative">

                <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    value={city}
                    onFocus={() =>
                        setFocused(true)
                    }
                    onBlur={() =>
                        setTimeout(
                            () =>
                                setFocused(
                                    false
                                ),
                            150
                        )
                    }
                    onChange={(e) =>
                        update(
                            e.target.value
                        )
                    }
                    placeholder="Search city..."
                    className="
                        h-12
                        w-full
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        pl-11
                        pr-4
                        text-sm
                        shadow-sm
                        transition
                        focus:border-emerald-500
                        focus:outline-none
                        focus:ring-4
                        focus:ring-emerald-100
                    "
                />

            </div>

            {focused &&
                filteredCities.length >
                    0 && (

                    <div
                        className="
                            absolute
                            z-50
                            mt-2
                            max-h-72
                            w-full
                            overflow-y-auto
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            py-2
                            shadow-xl
                        "
                    >

                        {filteredCities.map(
                            (
                                cityName
                            ) => (
                                <button
                                    key={
                                        cityName
                                    }
                                    type="button"
                                    onClick={() =>
                                        update(
                                            cityName
                                        )
                                    }
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        px-4
                                        py-3
                                        text-left
                                        text-sm
                                        transition
                                        hover:bg-gray-100
                                    "
                                >

                                    <MapPin
                                        size={
                                            16
                                        }
                                        className="text-gray-400"
                                    />

                                    {
                                        cityName
                                    }

                                </button>
                            )
                        )}

                    </div>

                )}

        </div>
    );
}