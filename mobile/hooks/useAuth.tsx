import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import axios from "axios";

import { Platform } from "react-native";

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY =
    "nexora_access_token";

export interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    city?: string;
    createdAt?: string;
    verified?: boolean;
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface VerifyTwoFactorData {
    userId: string;
    code: string;
    email?: string;
}

interface AuthContextValue {
    user: User | null;
    loading: boolean;

    login: (
        data: LoginData
    ) => Promise<{
        requiresTwoFactor: boolean;
        userId?: string;
    }>;

    loginWithGoogle: (
        idToken: string
    ) => Promise<void>;

    loginWithFacebook: (
        accessToken: string
    ) => Promise<void>;

    verifyTwoFactor: (
        data: VerifyTwoFactorData
    ) => Promise<void>;

    register: (
        data: RegisterData
    ) => Promise<void>;

    logout: () => Promise<void>;

    refreshUser: () => Promise<void>;
}

const AuthContext =
    createContext<
        AuthContextValue | undefined
    >(undefined);

interface Props {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: Props) {
    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    async function getStoredToken(): Promise<
        string | null
    > {
        if (Platform.OS === "web") {
            return AsyncStorage.getItem(
                TOKEN_KEY
            );
        }

        return SecureStore.getItemAsync(
            TOKEN_KEY
        );
    }

    async function saveToken(
        token: string
    ): Promise<void> {
        if (Platform.OS === "web") {
            await AsyncStorage.setItem(
                TOKEN_KEY,
                token
            );

            return;
        }

        await SecureStore.setItemAsync(
            TOKEN_KEY,
            token
        );
    }

    async function removeStoredToken(): Promise<void> {
        if (Platform.OS === "web") {
            await AsyncStorage.removeItem(
                TOKEN_KEY
            );

            return;
        }

        await SecureStore.deleteItemAsync(
            TOKEN_KEY
        );
    }
    async function fetchCurrentUser(
        token: string
    ) {
        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const response =
            await axios.get<User>(
                `${API_URL}/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 30000,
                }
            );

        return response.data;
    }

    async function restoreSession() {
        try {
            const token =
                await getStoredToken();

            if (!token) {
                setUser(null);
                return;
            }

            const currentUser =
                await fetchCurrentUser(
                    token
                );

            setUser(currentUser);
        } catch (error) {
            console.log(
                "Session restore failed:",
                error
            );

            await removeStoredToken();

            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        restoreSession();
    }, []);

    /*
     * LOGIN
     *
     * Primul pas:
     * email + password
     *
     * Dacă 2FA este activ:
     * backend returnează:
     *
     * {
     *   success: true,
     *   requiresTwoFactor: true,
     *   userId: "..."
     * }
     *
     * Nu încercăm să căutăm token.
     */

    async function login(
        data: LoginData
    ) {
        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const response =
            await axios.post(
                `${API_URL}/auth/login`,
                {
                    email: data.email,
                    password:
                        data.password,
                },
                {
                    timeout: 30000,
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        const responseData =
            response.data;

        /*
         * 2FA REQUIRED
         */

        if (
            responseData?.requiresTwoFactor ===
            true
        ) {
            if (
                !responseData?.userId
            ) {
                throw new Error(
                    "Backend-ul nu a returnat userId pentru verificarea 2FA."
                );
            }

            return {
                requiresTwoFactor:
                    true,
                userId:
                    responseData.userId,
            };
        }

        /*
         * NORMAL LOGIN
         */

        const token =
            responseData?.token ??
            responseData?.accessToken ??
            responseData?.data?.token ??
            responseData?.data?.accessToken;

        if (!token) {
            console.error(
                "Login response:",
                responseData
            );

            throw new Error(
                "Backend-ul nu a returnat tokenul de autentificare."
            );
        }

        await saveToken(token);

        const currentUser =
            await fetchCurrentUser(
                token
            );

        setUser(currentUser);

        return {
            requiresTwoFactor:
                false,
        };
    }

    /*
     * GOOGLE LOGIN
     *
     * POST /auth/google
     * { credential: idToken }
     */
    async function loginWithGoogle(
        idToken: string
    ) {
        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        if (!idToken) {
            throw new Error(
                "Google nu a returnat ID token."
            );
        }

        const response =
            await axios.post(
                `${API_URL}/auth/google`,
                {
                    credential: idToken,
                },
                {
                    timeout: 30000,
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        const responseData =
            response.data;

        const token =
            responseData?.token ??
            responseData?.accessToken ??
            responseData?.data?.token ??
            responseData?.data?.accessToken;

        if (!token) {
            console.error(
                "Google login response:",
                responseData
            );

            throw new Error(
                "Backend-ul nu a returnat tokenul după Google Login."
            );
        }

        await saveToken(token);

        const currentUser =
            await fetchCurrentUser(
                token
            );

        setUser(currentUser);
    }

    async function loginWithFacebook(
        accessToken: string
    ): Promise<void> {
        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        if (!accessToken) {
            throw new Error(
                "Facebook nu a returnat access token."
            );
        }

        const response = await axios.post(
            `${API_URL}/auth/facebook`,
            { accessToken },
            {
                timeout: 30000,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const responseData = response.data;
        const token =
            responseData?.token ??
            responseData?.accessToken ??
            responseData?.data?.token ??
            responseData?.data?.accessToken;

        if (!token) {
            console.error(
                "Facebook login response:",
                responseData
            );
            throw new Error(
                "Backend-ul nu a returnat tokenul de autentificare Facebook."
            );
        }

        await saveToken(token);
        const currentUser = await fetchCurrentUser(token);
        setUser(currentUser);
    }

    /*
     * 2FA LOGIN
     *
     * Backend:
     *
     * POST /auth/2fa/login
     *
     * {
     *   userId,
     *   token
     * }
     */

    async function verifyTwoFactor(
        data: VerifyTwoFactorData
    ) {
        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const response =
            await axios.post(
                `${API_URL}/auth/2fa/login`,
                {
                    userId:
                        data.userId,

                    token:
                        data.code,
                },
                {
                    timeout: 30000,
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        const responseData =
            response.data;

        const token =
            responseData?.token;

        if (!token) {
            throw new Error(
                "Backend-ul nu a returnat tokenul după verificarea 2FA."
            );
        }

        await saveToken(token);

        const currentUser =
            await fetchCurrentUser(
                token
            );

        setUser(currentUser);
    }


    async function register(
        data: RegisterData
    ) {
        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const response =
            await axios.post(
                `${API_URL}/auth/register`,
                {
                    username:
                        data.username,
                    email:
                        data.email,
                    password:
                        data.password,
                },
                {
                    timeout: 30000,
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        const responseData =
            response.data;

        const token =
            responseData?.token ??
            responseData?.accessToken ??
            responseData?.data?.token ??
            responseData?.data?.accessToken;

        if (token) {
            await saveToken(token);

            const currentUser =
                await fetchCurrentUser(
                    token
                );

            setUser(currentUser);

            return;
        }

        setUser(null);
    }

    async function logout() {
        await removeStoredToken();

        setUser(null);

        router.replace(
            "/(auth)/login"
        );
    }

    async function refreshUser() {
        try {
            const token =
                await getStoredToken();

            if (!token) {
                setUser(null);
                return;
            }

            const currentUser =
                await fetchCurrentUser(
                    token
                );

            setUser(currentUser);
        } catch {
            await removeStoredToken();

            setUser(null);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                loginWithGoogle,
                loginWithFacebook,
                verifyTwoFactor,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}