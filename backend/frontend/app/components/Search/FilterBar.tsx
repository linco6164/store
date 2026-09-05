"use client";

import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import ConditionFilter from "./ConditionFilter";
import CityFilter from "./CityFilter";
import SortSelect from "./SortSelect";

export default function FilterBar() {
    return (
        <section className="sticky top-20 z-30 rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur-xl">

            <div className="space-y-5">

                {/* Search */}

                <SearchBar />

                {/* Filters */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    <CategoryFilter />

                    <PriceFilter />

                    <ConditionFilter />

                    <CityFilter />

                    <SortSelect />

                </div>

            </div>

        </section>
    );
}