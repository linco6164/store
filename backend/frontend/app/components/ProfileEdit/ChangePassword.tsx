"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { profileService } from "../../services/profile.service";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Parolele nu coincid.");
            return;
        }

        try {
            setLoading(true);

            await profileService.changePassword({
                currentPassword,
                newPassword,
            });

            alert("Parola a fost schimbată.");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            alert("Nu s-a putut schimba parola.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

                <Lock className="text-gray-700" />

                <h2 className="text-2xl font-semibold">
                    Schimbă parola
                </h2>

            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* Parola actuală */}

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Parola actuală
                    </label>

                    <div className="relative">

                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                            className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:border-black"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowCurrent(!showCurrent)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {showCurrent ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>

                    </div>

                </div>

                {/* Parolă nouă */}

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Parolă nouă
                    </label>

                    <div className="relative">

                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                            className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:border-black"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowNew(!showNew)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {showNew ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>

                    </div>

                </div>

                {/* Confirmare */}

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Confirmă parola nouă
                    </label>

                    <div className="relative">

                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:border-black"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirm(!showConfirm)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {showConfirm ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>

                    </div>

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="
                        rounded-xl
                        bg-black
                        px-6
                        py-3
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                        disabled:opacity-60
                    "
                >
                    {loading
                        ? "Se actualizează..."
                        : "Actualizează parola"}
                </button>

            </form>

        </section>
    );
}