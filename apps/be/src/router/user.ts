import { Router } from "express";
import { authMiddleware } from "../middleware";
const app = Router();
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

app.post('/signup', authMiddleware, async (req, res) => {

    const body = req.body;

    const parsedData = SignupSchema.safeparse(body);

    if(!parsedData.success) {
        console.log(parsedData.error);
        return res.json({
            message: "Incorrect inputs"
        })
    }

    const userExists = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username
        }
    })

    if(userExists) {
        return res.status(403).json({
            message: "User already exists"
        })
    }

    await prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: parsedData.data.password,  // need to hash password, will do later
            name: parsedData.data.name
        }
    })

    //send email that user is signed up

    console.log("signup route");
    res.json({
        message: "signup point"
    })
})

app.post('/signin', authMiddleware, (req, res) => {
    console.log("signin route");
    res.json({
        message: "signin point"
    })
})


export const userRouter = app;