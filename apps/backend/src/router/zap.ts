import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware";
import { PrismaClient } from ".prisma/client";

const prismaClient = new PrismaClient();
const router = Router();
const typedRouter = router as any;

typedRouter.post("/", authMiddleware, async (req: Request, res: Response) => {
  if (!req.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = parseInt(req.id);
  const { availableTriggerId, triggerMetadata, actions } = req.body;

  try {
    // First verify the trigger exists
    const triggerExists = await prismaClient.availableTrigger.findUnique({
      where: { id: availableTriggerId },
    });

    if (!triggerExists) {
      return res.status(400).json({ message: "Invalid trigger ID" });
    }

    // Then verify all actions exist
    for (const action of actions) {
      const actionExists = await prismaClient.availableAction.findUnique({
        where: { id: action.availableActionId },
      });
      if (!actionExists) {
        return res.status(400).json({
          message: "Invalid action ID",
          actionId: action.availableActionId,
        });
      }
    }

    const zap = await prismaClient.zap.create({
      data: {
        AvailableTriggerId: availableTriggerId,
        userId,
        trigger: {
          create: {
            triggerId: availableTriggerId,
            metadata: triggerMetadata || {},
          },
        },
        actions: {
          create: actions.map((action: any, index: number) => ({
            actionId: action.availableActionId,
            metadata: action.actionMetadata || {},
            sortingOrder: index,
          })),
        },
      },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    return res.status(201).json({ zap });
  } catch (error) {
    console.error("Error creating zap:", error);
    return res.status(500).json({
      message: "Failed to create zap",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

typedRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  if (!req.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = parseInt(req.id);
  const zaps = await prismaClient.zap.findMany({
    where: {
      userId,
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  return res.json({
    zaps,
  });
});

typedRouter.get(
  "/:zapId",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(req.id);
    const zapId = req.params.zapId;

    const zap = await prismaClient.zap.findFirst({
      where: {
        id: zapId,
        userId,
      },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    if (!zap) {
      return res.status(404).json({ message: "Zap not found" });
    }

    return res.json({ zap });
  }
);

export const zapRouter = typedRouter;
