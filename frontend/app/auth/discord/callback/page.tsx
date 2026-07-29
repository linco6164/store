"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API } from "@/app/lib/api";

export default function DiscordCallback() {

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

        const res = await fetch(`${API}/auth/discord`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                code,
            }),

        });

        const data = await res.json();

        if (!res.ok) {

            alert(data.message);

            router.push("/login");

            return;

        }

        localStorage.setItem("token", data.token);

        router.push("/dashboard");

    }

    return (
        <div className="flex h-screen items-center justify-center">
            Logging in with Discord...
        </div>
    );
}