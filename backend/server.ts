import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./modules/upload/upload.routes.js"

import { listingRoutes } from "./modules/listing/index.js";
import profileRoutes from "./modules/profile/profile.routes.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/profile", profileRoutes)

async function start() {
  await connectDB();

  app.get("/", (req, res) => {
    res.send("API is running");
  });

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);