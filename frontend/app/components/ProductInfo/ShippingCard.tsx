"use client";

import {
    Truck,
    ShieldCheck,
    MapPin,
    CreditCard,
} from "lucide-react";

export default function ShippingCard() {
    return (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">
                Livrare și plată
            </h2>

            <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                    <Truck className="text-emerald-600" size={24} />

                    <div>
                        <h3 className="font-semibold">
                            Livrare rapidă
                        </h3>

                        <p className="text-sm text-gray-500">
                            Sameday, Fan Courier și GLS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                    <MapPin className="text-blue-600" size={24} />

                    <div>
                        <h3 className="font-semibold">
                            Predare personală
                        </h3>

                        <p className="text-sm text-gray-500">
                            Disponibilă dacă vânzătorul acceptă.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                    <CreditCard className="text-purple-600" size={24} />

                    <div>
                        <h3 className="font-semibold">
                            Plată securizată
                        </h3>

                        <p className="text-sm text-gray-500">
                            Plata va fi procesată în siguranță prin Nexora.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                    <ShieldCheck className="text-green-600" size={24} />

                    <div>
                        <h3 className="font-semibold">
                            Protecția cumpărătorului
                        </h3>

                        <p className="text-sm text-gray-500">
                            Beneficiezi de suport și protecție pentru comenzile eligibile.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}