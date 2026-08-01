"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import FullPageLoader from "../Feedback/FullPageLoader";

interface EnableTwoFactorModalProps {
    open: boolean;
    onClose: () => void;
    onEnabled: () => void;
}

export default function EnableTwoFactorModal({
    open,
    onClose,
    onEnabled,
}: EnableTwoFactorModalProps) {
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [secret, setSecret] = useState("");
    const [qrCode, setQrCode] = useState("");

    const [token, setToken] = useState("");

    const [error, setError] = useState("");

    const [enabled, setEnabled] = useState(false);

    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

    useEffect(() => {
        if (!open) return;

        loadSetup();
    }, [open]);

    async function loadSetup() {
        try {
            setLoading(true);
            setError("");

            const { data } = await api.post("/profile/2fa/setup");

            setSecret(data.secret);
            setQrCode(data.qrCode);
        } catch (err: any) {
            setError(
                err.response?.data?.message ??
                    "Failed to generate QR Code."
            );
        } finally {
            setLoading(false);
        }
    }

    async function verify() {
        try {
            setVerifying(true);
            setError("");

            const { data } = await api.post(
                "/profile/2fa/verify",
                {
                    token,
                }
            );

            setEnabled(true);

            setRecoveryCodes(data.recoveryCodes);

            onEnabled();
        } catch (err: any) {
            setError(
                err.response?.data?.message ??
                    "Invalid verification code."
            );
        } finally {
            setVerifying(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">

                {!enabled ? (
                    <>
                        <h2 className="text-2xl font-bold">
                            Enable Two-Factor Authentication
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Scan the QR code below using
                            Google Authenticator,
                            Microsoft Authenticator,
                            Authy or another TOTP app.
                        </p>

                        {loading ? (
                            <FullPageLoader
                                compact
                                label="Se generează codul QR…"
                            />
                        ) : (
                            <>
                                <div className="mt-6 flex justify-center">

                                    {qrCode && (
                                        <img
                                            src={qrCode}
                                            alt="QR Code"
                                            className="h-56 w-56 rounded-lg border"
                                        />
                                    )}

                                </div>

                                <div className="mt-6">

                                    <p className="text-sm text-gray-500">
                                        Manual setup key
                                    </p>

                                    <div className="mt-2 rounded-lg border bg-gray-50 p-3 font-mono break-all">
                                        {secret}
                                    </div>

                                </div>

                                <div className="mt-6">

                                    <label className="mb-2 block font-medium">
                                        Verification Code
                                    </label>

                                    <input
                                        value={token}
                                        onChange={(e) =>
                                            setToken(
                                                e.target.value.replace(/\D/g, "")
                                            )
                                        }
                                        maxLength={6}
                                        placeholder="123456"
                                        className="w-full rounded-lg border p-3 text-center text-2xl tracking-[8px]"
                                    />

                                </div>

                                {error && (
                                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end gap-3">

                                    <button
                                        onClick={onClose}
                                        className="rounded-lg border px-5 py-2"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={
                                            verifying ||
                                            token.length !== 6
                                        }
                                        onClick={verify}
                                        className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
                                    >
                                        {verifying
                                            ? "Verifying..."
                                            : "Verify & Enable"}
                                    </button>

                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-green-600">
                            Two-Factor Authentication Enabled
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Save these recovery codes in a safe
                            place. They can be used if you lose
                            access to your authenticator app.
                        </p>

                        <div className="mt-6 rounded-lg border bg-gray-50 p-4">

                            {recoveryCodes.map((code) => (
                                <div
                                    key={code}
                                    className="font-mono"
                                >
                                    {code}
                                </div>
                            ))}

                        </div>

                        <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                            These codes will not be shown again.
                        </div>

                        <div className="mt-8 flex justify-end">

                            <button
                                onClick={onClose}
                                className="rounded-lg bg-black px-5 py-2 text-white"
                            >
                                Done
                            </button>

                        </div>
                    </>
                )}

            </div>

        </div>
    );
}
