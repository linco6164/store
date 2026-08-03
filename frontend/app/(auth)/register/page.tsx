"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/app/hooks/useAuth";
import AuthService from "@/app/services/auth.service";

import {
    registerSchema,
    type RegisterForm,
} from "@/app/validators/auth.validator";

export default function RegisterPage() {
    const router = useRouter();

    const { login: authLogin } = useAuth();

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(form: RegisterForm) {
        try {
            const data = await AuthService.register(form);

            if (data.token) {
                await authLogin(data.token);

                router.push("/");
                return;
            }

            alert(data.message || "Account created successfully.");

            router.push("/login");
        } catch (error: any) {
            alert(
                error.response?.data?.message ??
                    "Registration failed."
            );
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg"
            >
                <h1 className="mb-6 text-3xl font-bold">
                    Register
                </h1>

                {/* Username */}

                <div className="mb-4">
                    <input
                        {...register("username")}
                        placeholder="Username"
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                    />

                    {errors.username && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.username.message}
                        </p>
                    )}
                </div>

                {/* Email */}

                <div className="mb-4">
                    <input
                        {...register("email")}
                        type="email"
                        placeholder="Email"
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                    />

                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}

                <div className="mb-6">
                    <input
                        {...register("password")}
                        type="password"
                        placeholder="Password"
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                    />

                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Creating account..."
                        : "Register"}
                </button>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </main>
    );
}