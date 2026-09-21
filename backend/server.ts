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
import { authenticateSocket } from "./sockets/socketAuth.js";
import favoriteRoutes from "./modules/favorite/favorite.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import walletRoutes from "./modules/wallet/wallet.routes.js";
import supportRoutes from "./modules/support/support.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import addressRoutes from "./modules/profile/address.routes.js";
import sessionRoutes from "./modules/auth/session.routes.js";
import emailVerificationRoutes from "./modules/profile/email-verification/email-verification.routes.js";
import phoneVerificationRoutes from "./modules/profile/phone-verification/phone-verification.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import promotionRoutes from "./modules/promotion/promotion.routes.js";

import registerChatSocket from "./sockets/chat.socket.js";
import registerSupportSocket from "./sockets/support.socket.js";

import mongoose from "mongoose";

import { setSocketIO } from "./sockets/socket.io.js";

const app = express();

app.set("trust proxy", true);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

setSocketIO(io);

io.use(authenticateSocket);

registerChatSocket(io);
registerSupportSocket(io);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRoutes);

app.use("/auth/sessions", sessionRoutes);

app.use("/upload", uploadRoutes);

app.use("/listings", listingRoutes);

app.use ("/orders", orderRoutes);

app.use("/reviews", reviewRoutes);

app.use("/promotions", promotionRoutes);

app.use("/profile/addresses", addressRoutes);

app.use(
  "/profile/phone-verification",
  phoneVerificationRoutes,
);

app.use("/profile", profileRoutes);

app.use("/wallet", walletRoutes);

app.use("/profile/2fa", twoFactorRoutes);

app.use("/chat", chatRoutes);

app.use("/favorites", favoriteRoutes);

app.use("/notifications", notificationRoutes);

app.use("/payments", paymentRoutes);

app.use("/admin", adminRoutes);

app.use("/support", supportRoutes);

app.use("/profile/email-verification", emailVerificationRoutes);

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

console.log("Registered models:", mongoose.modelNames());

start().catch(console.error);
