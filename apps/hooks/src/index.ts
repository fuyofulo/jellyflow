import express from "express";
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const app = express();
app.use(express.json());


app.post('/webhook/catch/:userId/:zapId', async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    // storing this trigger in both main and outbox database
    // we are using a transaction so that it gets stored in both or none

    await client.$transaction(async tx => {
        
        // creating zapRun for the zap
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body
            }
        });
        
        // creating an outbox entry for the zaprun
        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        });
    })

    res.json({
        message: "webhook received"
    })
})

app.listen(3000);