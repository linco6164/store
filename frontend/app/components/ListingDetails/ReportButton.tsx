"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Listing } from "@/app/types/listing";

type ReportButtonProps = {
    listing: Listing;
};

const reasons = [
    "Conținut neadecvat",
    "Produs fals",
    "Anunț înșelător",
    "Spam",
    "Alt motiv",
];

export default function ReportButton({
    listing,
}: ReportButtonProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!reason) {
            alert("Selectează un motiv.");
            return;
        }

        console.log({
            listingId: listing._id,
            reason,
        });

        alert("Raportul a fost trimis.");

        setReason("");
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700"
            >
                <AlertTriangle size={18} />
                Raportează anunțul
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Raportează anunțul
                            </h2>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {reasons.map((item) => (
                                <label
                                    key={item}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={item}
                                        checked={reason === item}
                                        onChange={(e) =>
                                            setReason(e.target.value)
                                        }
                                    />

                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="mt-6 w-full rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                        >
                            Trimite raportul
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}