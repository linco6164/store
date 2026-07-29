"use client";

const categories = [
    "👗 Fashion",
    "👟 Încălțăminte",
    "📱 Electronice",
    "💻 Laptopuri",
    "🎮 Gaming",
    "⌚ Ceasuri",
    "🏡 Casă",
    "🧸 Copii",
];

export default function Categories() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-8">

            <div className="flex gap-3 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        className="whitespace-nowrap rounded-full border bg-white px-5 py-2 text-sm transition hover:border-emerald-500 hover:text-emerald-600"
                    >
                        {category}
                    </button>
                ))}
            </div>

        </section>
    );
}