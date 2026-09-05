import axios, {
    AxiosError,
    AxiosRequestConfig,
} from "axios";

import {
    getToken,
    removeToken,
} from "./auth";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const status = error.response?.status;

        switch (status) {
            case 401: {
                removeToken();

                if (
                    typeof window !== "undefined"
                ) {
                    window.location.href =
                        "/login";
                }

                break;
            }

            case 403:
                console.error("Forbidden");
                break;

            case 404:
                console.error("Not Found");
                break;

            case 429:
                console.error(
                    "Too many requests"
                );
                break;

            case 500:
                console.error(
                    "Internal server error"
                );
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export async function uploadRequest<T>(
    url: string,
    data: FormData,
    config?: AxiosRequestConfig
) {
    const response =
        await api.post<T>(url, data, {
            ...config,
            headers: {
                "Content-Type":
                    "multipart/form-data",
            },
        });

    return response.data;
}