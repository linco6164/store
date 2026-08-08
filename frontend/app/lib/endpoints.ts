export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        TWO_FACTOR_LOGIN: "/auth/2fa/login",
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
        SEARCH: "/listings/search",
        UPDATE: (id: string) => `/listings/${id}`,
        DELETE: (id: string) => `/listings/${id}`,
    },

    PROFILE: {
        ME: "/profile",
        PUBLIC: (userId: string) =>
            `/profile/${userId}`,
        CHANGE_PASSWORD: "/profile/password",
    },

    FAVORITES: {
        GET_ALL: "/favorites",

        CHECK: (listingId: string) =>
            `/favorites/check/${listingId}`,

        ADD: (listingId: string) =>
            `/favorites/${listingId}`,

        REMOVE: (listingId: string) =>
            `/favorites/${listingId}`,

        TOGGLE: (listingId: string) =>
            `/favorites/${listingId}/toggle`,
    },

    NOTIFICATIONS: {
        ALL: "/notifications",
        UNREAD_COUNT:
            "/notifications/unread-count",

        READ: (id: string) =>
            `/notifications/${id}/read`,

        READ_ALL:
            "/notifications/read-all",

        DELETE: (id: string) =>
            `/notifications/${id}`,
    },
};