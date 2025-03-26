import { Router } from "express";
import { PrismaClient } from ".prisma/client";

const prismaClient = new PrismaClient();

const router = Router();

router.get("/available", async (req, res) => {
    console.log("triggers were requested");
    const availableTriggers = await prismaClient.availableTrigger.findMany({});
    res.json({
        availableTriggers
    })
});

export const triggerRouter = router;