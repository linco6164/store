"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    provider: "credentials" | "google" | "facebook" | "discord";
}

export function useCurrentUser() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const res = await fetch("http://localhost:3001/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                localStorage.removeItem("token");
                setUser(null);
                setLoading(false);
                return;
            }

            const data = await res.json();

            setUser(data);
        } catch (err) {
            console.error(err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    return {
        user,
        loading,
        reload: loadUser,
    };
}