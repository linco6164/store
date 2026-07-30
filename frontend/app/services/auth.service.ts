import { api } from "@/app/lib/api";
import { ENDPOINTS } from "@/app/lib/endpoints";

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

class AuthService {
    async register(dto: RegisterDto) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.REGISTER,
            dto
        );

        return data;
    }

    async login(dto: LoginDto) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.LOGIN,
            dto
        );

        return data;
    }

    async google(credential: string) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.GOOGLE,
            {
                credential,
            }
        );

        return data;
    }

    async facebook(accessToken: string) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.FACEBOOK,
            {
                accessToken,
            }
        );

        return data;
    }

    async me() {
        const { data } = await api.get(
            ENDPOINTS.AUTH.ME
        );

        return data;
    }

    async forgotPassword(email: string) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.FORGOT_PASSWORD,
            {
                email,
            }
        );

        return data;
    }

    async resetPassword(
        token: string,
        password: string
    ) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.RESET_PASSWORD,
            {
                token,
                password,
            }
        );

        return data;
    }

    async loginTwoFactor(
        userId: string,
        token: string
    ) {
        const { data } = await api.post(
            ENDPOINTS.AUTH.TWO_FACTOR_LOGIN,
            {
                userId,
                token,
            }
        );

        return data;
    }
}



export default new AuthService();