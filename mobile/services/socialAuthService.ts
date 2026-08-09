import axios from "axios";
import {
    GoogleSignin,
} from "@react-native-google-signin/google-signin";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

export function configureGoogle() {
    const webClientId =
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
        throw new Error(
            "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID nu este configurat."
        );
    }

    GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
    });
}

export async function loginWithGoogle() {
    if (!API_URL) {
        throw new Error(
            "EXPO_PUBLIC_API_URL nu este configurat."
        );
    }

    configureGoogle();

    await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
    });

    const result =
        await GoogleSignin.signIn();

    const idToken =
        result.data?.idToken;

    if (!idToken) {
        throw new Error(
            "Google nu a returnat un ID token."
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

    const token =
        response.data?.token ??
        response.data?.accessToken;

    if (!token) {
        throw new Error(
            "Backend-ul nu a returnat tokenul Nexora."
        );
    }

    return {
        token,
        user: response.data?.user,
    };
}