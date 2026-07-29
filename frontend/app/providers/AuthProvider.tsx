"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

export interface CurrentUser {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    provider: "credentials" | "google" | "facebook" | "discord";
}

interface AuthContextType {
    user: CurrentUser | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadUser() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const res = await fetch(
                "http://localhost:3001/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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

    useEffect(() => {
        loadUser();
    }, []);

    async function login(token: string) {
        localStorage.setItem("token", token);
        await loadUser();
    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                reload: loadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}