import { Listing } from "@/app/types/listing";

export const mockListings: Listing[] = [
    {
        _id: "1",
        title: "Nike Air Force 1 White",
        price: 250,
        currency: "RON",
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        ],
        city: "București",
        condition: "like_new",
        seller: {
            _id: "u1",
            username: "Andrei",
        },
        favorite: false,
        createdAt: new Date().toISOString(),
    },
    {
        _id: "2",
        title: "iPhone 15 Pro 256GB",
        price: 4200,
        currency: "RON",
        images: [
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
        ],
        city: "Cluj-Napoca",
        condition: "new",
        seller: {
            _id: "u2",
            username: "Maria",
        },
        favorite: true,
        createdAt: new Date().toISOString(),
    },
    {
        _id: "3",
        title: "PlayStation 5 Slim",
        price: 2100,
        currency: "RON",
        images: [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600",
        ],
        city: "Brașov",
        condition: "good",
        seller: {
            _id: "u3",
            username: "Alex",
        },
        favorite: false,
        createdAt: new Date().toISOString(),
    },
    {
        _id: "4",
        title: "Geacă Zara",
        price: 180,
        currency: "RON",
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        ],
        city: "Iași",
        condition: "like_new",
        seller: {
            _id: "u4",
            username: "Elena",
        },
        favorite: false,
        createdAt: new Date().toISOString(),
    },
];