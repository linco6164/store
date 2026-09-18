export interface Category {
    id: string;
    name: string;
    icon: string;
    subcategories: {
        id: string;
        name: string;
    }[];
}

export const categories: Category[] = [
    {
        id: "fashion",
        name: "Fashion",
        icon: "👗",
        subcategories: [
            { id: "women", name: "Femei" },
            { id: "men", name: "Bărbați" },
            { id: "accessories", name: "Accesorii" },
            { id: "bags", name: "Genți" },
            { id: "jewelry", name: "Bijuterii" },
        ],
    },
    {
        id: "shoes",
        name: "Încălțăminte",
        icon: "👟",
        subcategories: [
            { id: "women-shoes", name: "Femei" },
            { id: "men-shoes", name: "Bărbați" },
            { id: "kids-shoes", name: "Copii" },
            { id: "sneakers", name: "Sneakers" },
            { id: "boots", name: "Ghete și bocanci" },
        ],
    },
    {
        id: "electronics",
        name: "Electronice",
        icon: "📱",
        subcategories: [
            { id: "phones", name: "Telefoane" },
            { id: "tablets", name: "Tablete" },
            { id: "laptops", name: "Laptopuri" },
            { id: "computers", name: "Calculatoare" },
            { id: "tv", name: "TV și Audio" },
            { id: "cameras", name: "Foto și Video" },
            { id: "accessories", name: "Accesorii" },
        ],
    },
    {
        id: "gaming",
        name: "Gaming",
        icon: "🎮",
        subcategories: [
            { id: "consoles", name: "Console" },
            { id: "games", name: "Jocuri" },
            { id: "controllers", name: "Controllere" },
            { id: "gaming-pc", name: "PC Gaming" },
            { id: "gaming-accessories", name: "Accesorii Gaming" },
        ],
    },
    {
        id: "home",
        name: "Casă",
        icon: "🏠",
        subcategories: [
            { id: "furniture", name: "Mobilă" },
            { id: "decor", name: "Decorațiuni" },
            { id: "kitchen", name: "Bucătărie" },
            { id: "appliances", name: "Electrocasnice" },
            { id: "garden", name: "Grădină" },
        ],
    },
    {
        id: "beauty",
        name: "Beauty",
        icon: "💄",
        subcategories: [
            { id: "makeup", name: "Machiaj" },
            { id: "skincare", name: "Îngrijirea pielii" },
            { id: "haircare", name: "Îngrijirea părului" },
            { id: "perfumes", name: "Parfumuri" },
            { id: "bodycare", name: "Îngrijirea corpului" },
        ],
    },
    {
        id: "kids",
        name: "Copii",
        icon: "🧸",
        subcategories: [
            { id: "baby-clothes", name: "Haine copii" },
            { id: "toys", name: "Jucării" },
            { id: "baby-gear", name: "Articole pentru bebeluși" },
            { id: "kids-furniture", name: "Mobilier copii" },
        ],
    },
    {
        id: "sports",
        name: "Sport",
        icon: "⚽",
        subcategories: [
            { id: "fitness", name: "Fitness" },
            { id: "football", name: "Fotbal" },
            { id: "cycling", name: "Ciclism" },
            { id: "running", name: "Alergare" },
            { id: "outdoor", name: "Outdoor" },
        ],
    },
];