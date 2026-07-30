"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google";
import { loadFacebookSDK } from "../lib/facebook";
import { api } from "../lib/api";
import { ENDPOINTS } from "../lib/endpoints";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AuthService from "@/app/services/auth.service";

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [facebookReady, setFacebookReady] = useState(false);

    const router = useRouter();
    const { login: authLogin } = useAuth();

    useEffect(() => {
        loadFacebookSDK()
            .then(() => {
                setFacebookReady(true);
            })
            .catch(console.error);
    }, []);

    async function login() {
        try {
            const data = await AuthService.login(form);

            await authLogin(data.token);

            router.push("/");
        } catch (error: any) {
            alert(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    }

    async function googleLogin(credential: string) {
        try {
            const data = await AuthService.google(
                credential
            );

            await authLogin(data.token);

            router.push("/");
        } catch (error: any) {
            alert(
                error.response?.data?.message ||
                "Google Login Failed"
            );
        }
    }

    function facebookLogin() {
        if (!facebookReady || !window.FB) {
            alert("Facebook SDK is still loading...");
            return;
        }

        window.FB.login(
            function (response: any) {
                if (!response.authResponse) {
                    alert("Facebook Login Failed");
                    return;
                }

                handleFacebookLogin(response.authResponse.accessToken);
            },
            {
                scope: "public_profile,email",
            }
        );
    }

    async function handleFacebookLogin(accessToken: string) {
        try {
            const data = await AuthService.facebook(
                accessToken
            );

            await authLogin(data.token);

            router.push("/");
        } catch (error: any) {
            alert(
                error.response?.data?.message ||
                "Facebook Login Failed"
            );
        }
    }

    function discordLogin() {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
            redirect_uri: "https://nx-store.com/auth/discord/callback",
            response_type: "code",
            scope: "identify email",
            prompt: "consent",
        });

        window.location.href =
            `https://discord.com/oauth2/authorize?${params.toString()}`;
    }

    return (
        <main className="flex h-screen items-center justify-center">
            <div className="w-[400px] rounded-xl border p-8 shadow">

                <h1 className="mb-6 text-3xl font-bold">
                    Login
                </h1>

                <input
                    className="mb-3 w-full rounded border p-3"
                    placeholder="Email"
                    onChange={(e) =>
                        setForm({
                            ...form,
                            email: e.target.value,
                        })
                    }
                />

                <div className="w-full max-w-md">
                    <label className="mb-2 block font-medium">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value,
                                })
                            }
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-gray-300 p-3 pr-12 focus:border-blue-500 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <button
                    onClick={login}
                    className="w-full rounded bg-black p-3 text-white"
                >
                    Login
                </button>
                <div className="my-5 flex items-center">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="px-3 text-sm text-gray-500">
                        OR
                    </span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                <GoogleLogin
                    onSuccess={(credentialResponse) => {

                        if (!credentialResponse.credential) return;

                        googleLogin(
                            credentialResponse.credential
                        );

                    }}

                    onError={() => {

                        alert("Google Login Failed");

                    }}
                />
                <button
                    disabled={!facebookReady}
                    onClick={facebookLogin}
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#1877F2] px-4 py-3 font-medium text-white hover:bg-[#166fe5]"
                >
                    Continue with Facebook
                </button>
                <button
                    onClick={discordLogin}
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#5865F2] px-4 py-3 font-medium text-white hover:bg-[#4752c4]"
                >
                    Continue with Discord
                </button>
                <div className="mt-3 text-right">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>
                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </main>
    );
}