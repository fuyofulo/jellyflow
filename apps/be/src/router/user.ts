import { Request, Response } from "express";
import { SignupSchema } from "../schemas/signup";
import { prismaClient } from "../db/prisma";
import bcrypt from "bcrypt";

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
    const newUser = await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password: hashedPassword,
        name: parsedData.data.name,
        verified: false, // Explicitly set verification status
      },
    });

    // Add this return statement to complete the response
    return res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
});
