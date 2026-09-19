import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.js";
import * as twoFactorService from "./2fa.service.js";

export async function status(
    req: AuthRequest,
    res: Response
) {
    try {
        const result = await twoFactorService.getTwoFactorStatus(
            req.userId!
        );

        return res.json(result);

    } catch (err: any) {

        if (err.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Utilizatorul nu există.",
            });
        }

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
}

export async function setup(
    req: AuthRequest,
    res: Response
) {
    try {
        const result = await twoFactorService.setupTwoFactor(
            req.userId!
        );

        return res.json(result);

    } catch (err: any) {

        switch (err.message) {

            case "USER_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message: "Utilizatorul nu există.",
                });

            case "ALREADY_ENABLED":
                return res.status(400).json({
                    success: false,
                    message: "2FA este deja activat.",
                });

            default:
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Server error.",
                });
        }
    }
}

export async function verify(
    req: AuthRequest,
    res: Response
) {
    try {
        const { token } = req.body;

        const result =
            await twoFactorService.verifyTwoFactor(
                req.userId!,
                token
            );

        return res.json(result);

    } catch (err: any) {

        switch (err.message) {

            case "USER_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message: "Utilizatorul nu există.",
                });

            case "NO_SECRET":
                return res.status(400).json({
                    success: false,
                    message: "2FA nu a fost inițializat.",
                });

            case "INVALID_TOKEN":
                return res.status(400).json({
                    success: false,
                    message: "Codul introdus este invalid.",
                });

            default:
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Server error.",
                });
        }
    }
}

export async function disable(
    req: AuthRequest,
    res: Response
) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Introdu codul 2FA.",
            });
        }

        const result =
            await twoFactorService.disableTwoFactor(
                req.userId!,
                token
            );

        return res.json(result);

    } catch (err: any) {

        switch (err.message) {

            case "USER_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message: "Utilizatorul nu există.",
                });

            case "NOT_ENABLED":
                return res.status(400).json({
                    success: false,
                    message: "2FA nu este activat.",
                });

            case "INVALID_TOKEN":
                return res.status(400).json({
                    success: false,
                    message: "Codul 2FA este invalid.",
                });

            default:
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Server error.",
                });
        }
    }
}