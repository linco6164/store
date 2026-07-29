export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",

        ME: "/auth/me",

        GOOGLE: "/auth/google",

        FACEBOOK: "/auth/facebook",

        DISCORD: "/auth/discord",

        FORGOT_PASSWORD: "/auth/forgot-password",

        RESET_PASSWORD: "/auth/reset-password",
    },

    LISTINGS: {
        GET_ALL: "/listings",
        GET_ONE: (id: string) => `/listings/${id}`,
        CREATE: "/listings",
        UPDATE: (id: string) => `/listings/${id}`,
        DELETE: (id: string) => `/listings/${id}`,
    },

    PROFILE: {
    ME: "/profile",
    CHANGE_PASSWORD: "/profile/password",
},
};