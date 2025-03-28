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

  // {
  //     "availableTriggerId": "aac0e619-2094-4589-badc-fe487834f705",
  //     "triggerMetadata": {},
  //     "actions": [{
  //         "availableActionId": "103b134a-4dac-46a3-a4c3-621e9ffcfd79",
  //         "actionMetadata": {"message": "ethereum action send eth"}
  //     }, {
  //         "availableActionId": "d7f14946-bd36-4daa-9dca-2bbea2cb19b8",
  //         "actionMetadata": {"message": "solana action send sol"}
  //     }, {
  //         "availableActionId": "7fbe85fc-5a12-4103-8d00-264f117aaf37",
  //         "actionMetadata": {"message": "send slack message"}
  //     }, {
  //         "availableActionId": "f14c5d53-4563-41a2-9cdb-fcf5d184deda",
  //         "actionMetadata": {"message": "upload on drive"}
  //     }]
  // }

  const userId = req.id;
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
        zapName: req.body.zapName || "Untitled Zap",
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

  const userId = req.id;
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

  console.log(`${userId} just fetched their zaps`);

  return res.json({
    zaps,
  });
});

typedRouter.get(
  "/published",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(`${req.id} just fetched their published zaps`);

    const userId = req.id;
    const publishedZaps = await prismaClient.zap.findMany({
      where: {
        userId,
        isPublished: true,
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
      zaps: publishedZaps,
    });
  }
);

typedRouter.get(
  "/unpublished",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(`${req.id} just fetched their unpublished zaps`);

    const userId = req.id;
    const unpublishedZaps = await prismaClient.zap.findMany({
      where: {
        userId,
        isPublished: false,
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
      zaps: unpublishedZaps,
    });
  }
);

typedRouter.get(
  "/:zapId",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.id;
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

typedRouter.post(
  "/:zapId/edit",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.id;
    const zapId = req.params.zapId;
    const {
      availableTriggerId,
      triggerMetadata,
      actions,
      zapName,
      isPublished,
    } = req.body;

    try {
      // Check if the zap exists and belongs to the user
      const existingZap = await prismaClient.zap.findFirst({
        where: {
          id: zapId,
          userId,
        },
        include: {
          actions: true,
          trigger: true,
        },
      });

      if (!existingZap) {
        return res.status(404).json({ message: "Zap not found" });
      }

      // Verify the trigger exists
      const triggerExists = await prismaClient.availableTrigger.findUnique({
        where: { id: availableTriggerId },
      });

      if (!triggerExists) {
        return res.status(400).json({ message: "Invalid trigger ID" });
      }

      // Verify all actions exist
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

      // Delete existing actions
      await prismaClient.action.deleteMany({
        where: {
          zapId,
        },
      });

      // Delete existing trigger
      if (existingZap.trigger) {
        await prismaClient.trigger.delete({
          where: {
            zapId,
          },
        });
      }

      // Update the zap and create new related records
      const updatedZap = await prismaClient.zap.update({
        where: {
          id: zapId,
        },
        data: {
          zapName: zapName || "Untitled Zap",
          AvailableTriggerId: availableTriggerId,
          lastEdited: new Date(),
          // Only update isPublished if it's provided in the request
          ...(isPublished !== undefined && { isPublished }),
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

      return res.json({ zap: updatedZap });
    } catch (error) {
      console.error("Error updating zap:", error);
      return res.status(500).json({
        message: "Failed to update zap",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

typedRouter.post(
  "/:zapId/toggle-active",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.id;
    const zapId = req.params.zapId;

    try {
      // Check if the zap exists and belongs to the user
      const existingZap = await prismaClient.zap.findFirst({
        where: {
          id: zapId,
          userId,
        },
      });

      if (!existingZap) {
        return res.status(404).json({ message: "Zap not found" });
      }

      // Toggle the isActive state
      const updatedZap = await prismaClient.zap.update({
        where: {
          id: zapId,
        },
        data: {
          isActive: !existingZap.isActive,
          lastEdited: new Date(),
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

      return res.json({ zap: updatedZap });
    } catch (error) {
      console.error("Error toggling zap active state:", error);
      return res.status(500).json({
        message: "Failed to toggle zap active state",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

typedRouter.post(
  "/:zapId/delete",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.id;
    const zapId = req.params.zapId;

    try {
      // Check if the zap exists and belongs to the user
      const existingZap = await prismaClient.zap.findFirst({
        where: {
          id: zapId,
          userId,
        },
      });

      if (!existingZap) {
        return res.status(404).json({ message: "Zap not found" });
      }

      // Delete all actions associated with the zap
      await prismaClient.action.deleteMany({
        where: {
          zapId,
        },
      });

      // Delete the trigger associated with the zap
      await prismaClient.trigger.deleteMany({
        where: {
          zapId,
        },
      });

      // Finally, delete the zap itself
      await prismaClient.zap.delete({
        where: {
          id: zapId,
        },
      });

      return res.json({
        message: "Zap and associated data deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting zap:", error);
      return res.status(500).json({
        message: "Failed to delete zap",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Route to get a specific number of runs
typedRouter.get(
  "/:zapId/runs/:limit",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.id;
    const zapId = req.params.zapId;

    // Get limit from route param, constrain between 1 and 100
    let limit = 3; // Default fallback
    const limitParam = Number(req.params.limit);
    if (!isNaN(limitParam)) {
      limit = Math.max(1, Math.min(100, limitParam));
    }

    try {
      // First verify the zap exists and belongs to the user
      const zap = await prismaClient.zap.findFirst({
        where: {
          id: zapId,
          userId,
        },
      });

      if (!zap) {
        return res.status(404).json({ message: "Zap not found" });
      }

      // Fetch the limited zapRuns for this zap
      // Using both createdAt and id for reliable ordering
      const zapRuns = await prismaClient.zapRun.findMany({
        where: {
          zapId,
        },
        orderBy: [
          { createdAt: "desc" }, // Primary sort by createdAt
          { id: "desc" }, // Secondary sort by id as fallback
        ],
        take: limit,
        include: {
          zapRunOutbox: true,
        },
      });

      // Check if any zapRuns were found
      if (zapRuns.length === 0) {
        return res.json({
          message: "No zap runs found",
          zapRuns: [],
        });
      }

      // Ensure metadata is never null (this shouldn't happen based on the schema, but just to be safe)
      const processedZapRuns = zapRuns.map((run) => ({
        ...run,
        metadata: run.metadata ?? {},
      }));

      return res.json({
        zapRuns: processedZapRuns,
        limit,
        count: zapRuns.length,
      });
    } catch (error) {
      console.error("Error fetching zap runs:", error);
      return res.status(500).json({
        message: "Failed to fetch zap runs",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Route to get all runs
typedRouter.get(
  "/:zapId/runs",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.id;
    const zapId = req.params.zapId;

    try {
      // First verify the zap exists and belongs to the user
      const zap = await prismaClient.zap.findFirst({
        where: {
          id: zapId,
          userId,
        },
      });

      if (!zap) {
        return res.status(404).json({ message: "Zap not found" });
      }

      // Fetch all zapRuns for this zap
      // Using both createdAt and id for reliable ordering
      const zapRuns = await prismaClient.zapRun.findMany({
        where: {
          zapId,
        },
        orderBy: [
          { createdAt: "desc" }, // Primary sort by createdAt
          { id: "desc" }, // Secondary sort by id as fallback
        ],
        include: {
          zapRunOutbox: true,
        },
      });

      // Check if any zapRuns were found
      if (zapRuns.length === 0) {
        return res.json({
          message: "No zap runs found",
          zapRuns: [],
        });
      }

      // Ensure metadata is never null (this shouldn't happen based on the schema, but just to be safe)
      const processedZapRuns = zapRuns.map((run) => ({
        ...run,
        metadata: run.metadata ?? {},
      }));

      return res.json({
        zapRuns: processedZapRuns,
        count: zapRuns.length,
      });
    } catch (error) {
      console.error("Error fetching all zap runs:", error);
      return res.status(500).json({
        message: "Failed to fetch all zap runs",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export const zapRouter = typedRouter;
