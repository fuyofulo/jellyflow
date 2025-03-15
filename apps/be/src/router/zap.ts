import { Router } from "express";
import { authMiddleware } from "../middleware";
const app = Router();

app.post('/', authMiddleware, (req, res) => {
    console.log("create zap");
    res.json({
        message: "create zap"
    })
})

app.get('/', authMiddleware, (req, res) => {
    console.log("get all zaps of a user");
    res.json({
        message: "get all zaps of a user"
    })
})

app.get('/:zapId', authMiddleware, (req, res) => {
    console.log("get all zap runs of a zap");
    res.json({
        message: "get all zapRuns of a zap"
    })
})

export const zapRouter = app;