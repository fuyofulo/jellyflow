// src/index.ts
import express from "express";
import { userRouter } from "./router/user";
import { zapRouter } from "./router/zap";
import { PrismaClient } from "@prisma/client";
import { triggerRouter } from "./router/trigger";
import { actionRouter } from "./router/action";
import { verifyRouter } from "./router/verify";
import cors from "cors";

const app = express();

// Common middleware
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);
app.use("/api/v1/trigger", triggerRouter);
app.use("/api/v1/action", actionRouter);
app.use("/api/v1/verify", verifyRouter);

app.listen(3033);
