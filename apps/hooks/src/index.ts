import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const app = express();
const typedApp = app as any;
app.use(express.json());

typedApp.post(
  "/webhook/catch/:userId/:zapId",
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    try {
      // First check if the zap exists
      const zap = await client.zap.findFirst({
        where: {
          id: zapId,
          userId: parseInt(userId),
        },
      });

      // Check if zap exists and is active (after fetch)
      if (!zap || !(zap as any).isActive) {
        return res.status(404).json({
          message: "Zap not found or not active",
        });
      }

      // storing this trigger in both main and outbox database
      // we are using a transaction so that it gets stored in both or none
      await client.$transaction(async (tx) => {
        // creating zapRun for the zap
        const run = await tx.zapRun.create({
          data: {
            zapId: zapId,
            metadata: body,
          },
        });

        // creating an outbox entry for the zaprun
        await tx.zapRunOutbox.create({
          data: {
            zapRunId: run.id,
          },
        });
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

app.listen(3000);
