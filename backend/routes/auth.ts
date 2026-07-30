import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/Users.js";
import { OAuth2Client } from "google-auth-library";
import qs from "querystring";
import auth, { AuthRequest } from "../middleware/auth.js";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const exists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (exists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Account created",
            id: user._id,
        });

    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        console.log("Email primit:", email);
        console.log("User găsit:", user);

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        if (!user.password) {
            return res.status(401).json({
                message: "This account uses social login.",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        console.log(validPassword);

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (err) {
        res.status(500).json(err);
    }

});

router.post("/google", async (req, res) => {

    try {

        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                message: "Invalid Google Token",
            });
        }

        const {

            sub,
            email,
            name,
            picture,

        } = payload;

        let user = await User.findOne({
            email,
        });

        if (!user) {

            user = await User.create({

                username: name,

                email,

                provider: "google",

                googleId: sub,

                avatar: picture,

            });

        }

        const token = jwt.sign(

            {
                id: user._id,
            },

            process.env.JWT_SECRET!,

            {
                expiresIn: "7d",
            }

        );

        res.json({

            token,

            user: {

                id: user._id,

                username: user.username,

                email: user.email,

                avatar: user.avatar,

            },

        });

    } catch (err) {
        console.error("Google login error:", err);

        return res.status(500).json({
            message: "Google login failed",
            error: err instanceof Error ? err.message : err,
        });
    }

});

router.post("/facebook", async (req, res) => {
    try {
        const { accessToken } = req.body;
        console.log("Access Token:", accessToken);
        const response = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
        );

        const data = await response.json();

        console.log("Facebook status:", response.status);
        console.log("Facebook response:", data);

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        let user = await User.findOne({
            email: data.email,
        });

        if (!user) {
            user = await User.create({
                username: data.name,
                email: data.email,
                provider: "facebook",
                facebookId: data.id,
                avatar: data.picture?.data?.url,
            });
        } else {
            user.facebookId = data.id;

            if (data.picture?.data?.url) {
                user.avatar = data.picture.data.url;
            }

            await user.save();
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            token,
            user,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Facebook login failed",
        });
    }
});

router.post("/discord", async (req, res) => {
    try {
        const { code } = req.body;

        console.log({
            client_id: process.env.DISCORD_CLIENT_ID,
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
            code,
        });

        const tokenResponse = await fetch(
            "https://discord.com/api/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
                body: qs.stringify({
                    client_id: process.env.DISCORD_CLIENT_ID!,
                    client_secret:
                        process.env.DISCORD_CLIENT_SECRET!,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri:
                        process.env.DISCORD_REDIRECT_URI!,
                }),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return res.status(400).json(tokenData);
        }

        const userResponse = await fetch(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            }
        );

        const discordUser = await userResponse.json();

        if (!userResponse.ok) {
            return res.status(400).json(discordUser);
        }

        let user = await User.findOne({
            email: discordUser.email,
        });

        const avatar =
            discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : undefined;

        if (!user) {
            user = await User.create({
                username: discordUser.username,
                email: discordUser.email,
                provider: "discord",
                discordId: discordUser.id,
                avatar,
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Discord login failed",
        });
    }
});

router.post("/forgot-password", async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                message:
                    "If an account exists, a reset email has been sent.",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await user.save();

        const link =
            `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await sendEmail(
            user.email,
            "Reset your password",
            `
                <h2>Reset Password</h2>

                <p>You requested a password reset.</p>

                <a href="${link}">
                    Reset Password
                </a>

                <p>This link expires in 15 minutes.</p>
            `
        );

        res.json({
            message:
                "If an account exists, a reset email has been sent.",
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server error",
        });

    }

});

router.post("/reset-password", async (req, res) => {

    try {

        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({
            message: "Password updated successfully.",
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server error",
        });

    }

});

router.get(
    "/me",
    auth,
    async (req: AuthRequest, res) => {
        try {
            const user = await User.findById(req.userId).select(
                "-password"
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            res.json(user);
        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: "Server error",
            });
        }
    }
);

export default router;