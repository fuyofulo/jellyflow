import axios from "axios";
import { Request, Response, Router } from "express";

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  language_code: string;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: {
    id: number;
    first_name: string;
    username: string;
    type: string;
  };
  date: number;
  text: string;
  entities?: Array<{
    offset: number;
    length: number;
    type: string;
  }>;
}

interface TelegramUpdate {
  update_id: number;
  message: TelegramMessage;
}

interface TelegramResponse {
  ok: boolean;
  result: TelegramUpdate[];
}

/**
 * Verifies a Telegram username and returns the corresponding user ID
 * @param username The Telegram username to verify
 * @returns The user ID if found, null otherwise
 */
async function verifyTelegramUser(username: string): Promise<number | null> {
  try {
    const response = await axios.get<TelegramResponse>(
      "https://api.telegram.org/bot7690714550:AAEFlClSPEduW85Uu81SFBNOIbxmFj_R1Ds/getUpdates"
    );

    const { data } = response;

    if (!data.ok || !data.result.length) {
      return null;
    }

    // Log for debugging
    console.log(`Searching for username: ${username}`);
    console.log(`Found ${data.result.length} updates from Telegram`);

    // Find the update with the matching username (case insensitive)
    const normalizedUsername = username.toLowerCase().trim();

    for (const update of data.result) {
      if (
        update.message?.from?.username?.toLowerCase() === normalizedUsername
      ) {
        console.log(`Found matching user with ID: ${update.message.from.id}`);
        return update.message.from.id;
      }
    }

    console.log(`No matching username found for: ${username}`);
    return null;
  } catch (error) {
    console.error("Error verifying Telegram user:", error);
    return null;
  }
}

/**
 * GET request handler for Telegram username verification
 * @param req Express request object
 * @param res Express response object
 */
async function handleVerifyTelegramRequest(
  req: Request,
  res: Response
): Promise<void> {
  console.log(`[${new Date().toISOString()}] Received verify Telegram request`);
  console.log(`Request query parameters:`, req.query);

  try {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
      console.log(`Error: Invalid username parameter:`, username);
      res.status(400).json({ error: "Username parameter is required" });
      return;
    }

    console.log(`Attempting to verify Telegram username: "${username}"`);
    const userId = await verifyTelegramUser(username);

    if (userId === null) {
      console.log(`User not found for username: "${username}"`);
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log(
      `Successfully verified user. Username: "${username}", UserID: ${userId}`
    );
    // Return only the user ID as requested
    res.status(200).json({ userId });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error handling Telegram verification:`,
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
}

// Create a standalone router
const telegramRouter = Router();

// Set up the endpoint
telegramRouter.get("/verify", handleVerifyTelegramRequest);

// Export the router to be used in index.ts
export default telegramRouter;
