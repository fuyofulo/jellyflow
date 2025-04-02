// src/index.ts
import "dotenv/config"; // Load environment variables from .env file
import express from "express";
import { userRouter } from "./router/user";
import { zapRouter } from "./router/zap";
import { PrismaClient } from "@prisma/client";
import { triggerRouter } from "./router/trigger";
import { actionRouter } from "./router/action";
import { verifyRouter } from "./router/verify";
import telegramRouter from "./services/verifyTelegram";
import cors from "cors";

const app = express();

// Common middleware
app.use(express.json());
// Configure CORS to allow requests from both frontend sources
app.use(
  cors({
    origin: [
      "https://jellyflow.vercel.app",
      "http://localhost:3000",
      "http://49.43.229.57:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);
app.use("/api/v1/trigger", triggerRouter);
app.use("/api/v1/action", actionRouter);
app.use("/api/v1/verify", verifyRouter);
app.use("/api/v1/telegram", telegramRouter);

app.listen(3033, "0.0.0.0", () => {
  console.log("Backend server is listening on port 3033");
});
