import { Router, Request, Response } from "express";
import { PrismaClient } from ".prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

// Initialize Prisma client
const prismaClient = new PrismaClient();
const router = Router();
const typedRouter = router as any;

// Map to store pending verifications (email -> {code, userData})
// In production, you might want to use Redis or database storage
const pendingVerifications = new Map<
  string,
  {
    code: string;
    expiresAt: Date;
    userData: {
      email: string;
      password: string;
      name: string;
    };
  }
>();

// Generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Store a verification code for an email
export function storeVerificationCode(
  email: string,
  code: string,
  userData: any
): void {
  // Set expiration time (30 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  pendingVerifications.set(email, {
    code,
    expiresAt,
    userData,
  });
}

// Get stored verification info
export function getVerificationInfo(email: string) {
  return pendingVerifications.get(email);
}

// Verify code endpoint
typedRouter.post("/verify-email", async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ message: "Email and verification code are required" });
  }

  const verificationInfo = pendingVerifications.get(email);

  if (!verificationInfo) {
    return res
      .status(404)
      .json({ message: "No verification pending for this email" });
  }

  // Check if verification code has expired
  if (new Date() > verificationInfo.expiresAt) {
    pendingVerifications.delete(email);
    return res.status(410).json({ message: "Verification code has expired" });
  }

  // Check if code matches
  if (verificationInfo.code !== code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  try {
    // Code matches, create the user
    const userData = verificationInfo.userData;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prismaClient.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        verified: true,
      },
    });

    // Remove from pending verifications
    pendingVerifications.delete(email);

    // Generate authentication token
    const token = jwt.sign({ id: newUser.id }, JWT_PASSWORD);

    return res.status(201).json({
      message: "Email verified and user created successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error creating user after verification:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
});

// Resend verification code
typedRouter.post(
  "/resend-verification",
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const verificationInfo = pendingVerifications.get(email);

    if (!verificationInfo) {
      return res
        .status(404)
        .json({ message: "No verification pending for this email" });
    }

    // Generate new code
    const newCode = generateVerificationCode();

    // Update stored verification with new code
    storeVerificationCode(email, newCode, verificationInfo.userData);

    // Here we would send the email with the new code
    // This will be implemented in the user router

    return res.json({ message: "Verification code resent" });
  }
);

export const verifyRouter = typedRouter;
