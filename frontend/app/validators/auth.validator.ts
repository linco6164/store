import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .email("Please enter a valid email address."),

    password: z
        .string()
        .min(6, "Password must contain at least 6 characters."),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must contain at least 3 characters.")
            .max(30, "Username is too long."),

        email: z
            .email("Please enter a valid email address."),

        password: z
            .string()
            .min(8, "Password must contain at least 8 characters.")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter."
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter."
            )
            .regex(
                /\d/,
                "Password must contain at least one number."
            ),
    });

export type RegisterForm = z.infer<typeof registerSchema>;