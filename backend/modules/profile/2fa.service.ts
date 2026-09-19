import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import User from "../../models/Users.js";

export async function getTwoFactorStatus(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return {
        success: true,
        enabled: user.twoFactorEnabled === true,
    };
}

export async function setupTwoFactor(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    if (user.twoFactorEnabled) {
        throw new Error("ALREADY_ENABLED");
    }

    const secret = speakeasy.generateSecret({
        name: `Nexora Store (${user.email})`,
        issuer: "Nexora Store",
        length: 32,
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    user.twoFactorRecoveryCodes = [];

    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
        success: true,
        secret: secret.base32,
        qrCode,
    };
}

export async function verifyTwoFactor(
    userId: string,
    token: string
) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    if (!user.twoFactorSecret) {
        throw new Error("NO_SECRET");
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1,
    });

    if (!verified) {
        throw new Error("INVALID_TOKEN");
    }

    const recoveryCodes = Array.from(
        { length: 10 },
        () => crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    user.twoFactorEnabled = true;
    user.twoFactorRecoveryCodes = recoveryCodes;

    await user.save();

    return {
        success: true,
        message: "Autentificarea în doi pași a fost activată.",
        recoveryCodes,
    };
}

export async function disableTwoFactor(
    userId: string,
    token: string
) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error("NOT_ENABLED");
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1,
    });

    if (!verified) {
        throw new Error("INVALID_TOKEN");
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorRecoveryCodes = [];

    await user.save();

    return {
        success: true,
        message: "Autentificarea în doi pași a fost dezactivată.",
    };
}