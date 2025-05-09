import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const client = new PrismaClient();

const app = express();
const typedApp = app as any;
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

typedApp.post(
  "/webhook/catch/:userId/:zapId",
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    console.log(`${userId} just called the webhook for zap ${zapId}`);

    try {
      // First check if the zap exists
      const zap = await client.zap.findFirst({
        where: {
          id: zapId,
          userId: userId,
        },
      });

      // Check if zap exists and is active (after fetch)
      if (!zap || !(zap as any).isActive) {
        console.log("Zap not found or not active");
        return res.status(404).json({
          message: "Zap not found or not active",
        });
      }

      console.log("zap found");

      // storing this trigger in both main and outbox database
      // we are using a transaction so that it gets stored in both or none
      await client.$transaction(async (tx) => {
        // creating zapRun for the zap
        const run = await tx.zapRun.create({
          data: {
            zapId: zapId,
            metadata: body,
            // createdAt will be automatically set to current time
          },
        });
        console.log(`ZapRun created with ID: ${run.id} at ${run.createdAt}`);

        // creating an outbox entry for the zaprun
        const outbox = await tx.zapRunOutbox.create({
          data: {
            zapRunId: run.id,
          },
        });
        console.log(`Outbox entry created for ZapRun ID: ${run.id}`);
      });

      return res.json({
        message: "webhook received",
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({
        message: "Failed to process webhook",
      });
    }
  }
);

app.listen(4000, "0.0.0.0", () => {
  console.log("Project is active at port 4000");
});
