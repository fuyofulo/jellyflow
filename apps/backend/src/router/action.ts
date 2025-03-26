import { Router } from "express";
import { PrismaClient } from ".prisma/client";

const prismaClient = new PrismaClient();

const router = Router();

router.get("/available", async (req, res) => {
    console.log("actions were requested");
    const availableActions = await prismaClient.availableAction.findMany({});
    res.json({
        availableActions
    })
});

export const actionRouter = router;