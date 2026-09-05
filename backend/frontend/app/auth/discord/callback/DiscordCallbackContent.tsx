"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api";

export default function DiscordCallbackContent() {

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {

        const code = searchParams.get("code");

        if (!code) {
            router.push("/login");
            return;
        }

        login(code);

    }, []);

    async function login(code: string) {
    try {
        const { data } = await api.post("/auth/discord", {
            code,
        });

        localStorage.setItem("token", data.token);

        router.push("/");
    } catch (error: any) {
        alert(
            error.response?.data?.message ??
            "Discord login failed."
        );

        router.push("/login");
    }
}

    return (
        <div className="flex h-screen items-center justify-center">
            Logging in with Discord...
        </div>
    );
}