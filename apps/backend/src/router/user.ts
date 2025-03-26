import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { SignInSchema, SignupSchema } from "../types";
import { PrismaClient } from ".prisma/client";

const prismaClient = new PrismaClient();
const router = Router();
const typedRouter = router as any;

typedRouter.post("/signup", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  try {
    if (!parsedData.success) {
      console.log(parsedData.error);
      return res.json({
        message: "Incorrect inputs",
      });
    }

    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: parsedData.data.email,
      },
      select: {
        verified: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(parsedData.data!.password, 10);
    await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password: hashedPassword,
        name: parsedData.data.name,
        verified: false,
      },
    });
    console.log(`${parsedData.data.name} just signed up with email ${parsedData.data.email}`);
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
});

typedRouter.post("/signin", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SignInSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  });

  if (!user) {
    return res.status(403).json({
      message: "Invalid username or password",
    });
  }

  const passwordMatch = await bcrypt.compare(
    parsedData.data.password,
    hashedPassword
  );

  if (!passwordMatch) {
    console.log(`someone just tried to sign in with email ${parsedData.data.email}`);
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign({ id: user.id }, JWT_PASSWORD);
  console.log(`${user.name} just signed in with email ${user.email}`);
  res.json({
    message: "Login successful",
    token: token,
  });
});

typedRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  if (!req.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  return res.json({
    user,
  });
});

export const userRouter = typedRouter;
