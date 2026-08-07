"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import SearchDrawer from "./SearchDrawer";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import ConditionFilter from "./ConditionFilter";
import CityFilter from "./CityFilter";
import SortSelect from "./SortSelect";

export default function MobileFilters() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    font-semibold
                    shadow-sm
                    transition
                    hover:border-emerald-500
                    hover:bg-emerald-50
                    xl:hidden
                "
            >
                <SlidersHorizontal size={18} />

                Filters
            </button>

            <SearchDrawer
                open={open}
                title="Filters"
                onClose={() => setOpen(false)}
            >
                <div className="space-y-6">

                    <CategoryFilter />

                    <ConditionFilter />

                    <PriceFilter />

                    <CityFilter />

                    <SortSelect />

                    <div className="flex gap-3 pt-4">

                        <button
                            type="button"
                            onClick={() => {
                                window.location.search = "";
                            }}
                            className="
                                flex-1
                                rounded-2xl
                                border
                                border-gray-200
                                py-3
                                font-semibold
                                transition
                                hover:bg-gray-100
                            "
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setOpen(false)
                            }
                            className="
                                flex-1
                                rounded-2xl
                                bg-emerald-600
                                py-3
                                font-semibold
                                text-white
                                transition
                                hover:bg-emerald-700
                            "
                        >
                            Apply
                        </button>

                    </div>

                </div>

            </SearchDrawer>
        </>
    );
}