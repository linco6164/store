import { z } from "zod";

export const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Numele de utilizator trebuie să conțină minimum 3 caractere.")
        .max(30, "Numele de utilizator poate avea maximum 30 de caractere.")
        .regex(
            /^[a-zA-Z0-9._]+$/,
            "Sunt permise doar litere, cifre, punct și underscore."
        ),

    fullName: z
        .string()
        .max(100)
        .optional()
        .or(z.literal("")),

    email: z.string().email(),

    phone: z
        .string()
        .max(20)
        .optional()
        .or(z.literal("")),

    bio: z
        .string()
        .max(300)
        .optional()
        .or(z.literal("")),

    avatar: z
        .string()
        .optional()
        .or(z.literal("")),

    country: z
        .string()
        .max(100)
        .optional()
        .or(z.literal("")),

    city: z
        .string()
        .max(100)
        .optional()
        .or(z.literal("")),

    county: z
        .string()
        .max(100)
        .optional()
        .or(z.literal("")),

    postalCode: z
        .string()
        .max(20)
        .optional()
        .or(z.literal("")),

    // 👇 Adaugă acestea
    instagram: z
        .string()
        .url("Link Instagram invalid.")
        .optional()
        .or(z.literal("")),

    facebook: z
        .string()
        .url("Link Facebook invalid.")
        .optional()
        .or(z.literal("")),

    website: z
        .string()
        .url("Website invalid.")
        .optional()
        .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;