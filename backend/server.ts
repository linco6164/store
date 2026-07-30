import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import { listingRoutes } from "./modules/listing/index.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import twoFactorRoutes from "./modules/profile/2fa.routes.js";
import chatRoutes from "./routes/chat.js";

import registerChatSocket from "./sockets/chat.socket.js";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});

registerChatSocket(io);

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/listings", listingRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/profile/2fa", twoFactorRoutes);

app.use("/api/chat", chatRoutes);

app.get("/", (_, res) => {
    res.send("API is running");
});

async function start() {
    await connectDB();

    const PORT = Number(process.env.PORT) || 5000;

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

start().catch(console.error);