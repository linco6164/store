"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthService from "@/app/services/auth.service";
import { useAuth } from "@/app/hooks/useAuth";

export default function TwoFactorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const userId = searchParams.get("userId");

    const { login } = useAuth();

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function verifyCode() {
        try {
            setLoading(true);
            setError("");

            if (!userId) {
                setError("Utilizator invalid.");
                return;
            }

            if (code.length !== 6) {
                setError("Codul trebuie să conțină 6 cifre.");
                return;
            }

            const data = await AuthService.loginTwoFactor(
                userId,
                code
            );

            await login(data.token);

            router.replace("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message ??
                    "Cod invalid."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg">

                <h1 className="mb-2 text-3xl font-bold">
                    Two-Factor Authentication
                </h1>

                <p className="mb-6 text-gray-500">
                    Introdu codul din aplicația
                    Google Authenticator.
                </p>

                <label className="mb-2 block font-medium">
                    Verification Code
                </label>

                <input
                    value={code}
                    onChange={(e) =>
                        setCode(
                            e.target.value.replace(/\D/g, "")
                        )
                    }
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="123456"
                    className="mb-4 w-full rounded-lg border p-3 text-center text-2xl tracking-[8px] outline-none focus:border-blue-500"
                />

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    onClick={verifyCode}
                    disabled={loading}
                    className="w-full rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Verifying..."
                        : "Verify"}
                </button>
            </div>
        </main>
    );
}