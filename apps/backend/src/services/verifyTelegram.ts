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

// In-memory storage for recent telegram users
// In a production app, this should be in a database
const recentTelegramUsers = new Map<string, number>();

// Initialize with the known user from the JSON response
recentTelegramUsers.set("fuyofulo", 2146018099);

/**
 * Verifies a Telegram username and returns the corresponding user ID
 * @param username The Telegram username to verify
 * @returns The user ID if found, null otherwise
 */
async function verifyTelegramUser(username: string): Promise<number | null> {
  try {
    // Get the bot token from environment variables
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not set in environment variables");
      return null;
    }

    console.log(
      `Checking for Telegram username: ${username} with token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`
    );

    // Normalize the username for case-insensitive comparison
    const normalizedUsername = username.toLowerCase().trim();

    // First check our cached users
    if (recentTelegramUsers.has(normalizedUsername)) {
      const userId = recentTelegramUsers.get(normalizedUsername);
      console.log(
        `Found username ${username} in cache with user ID: ${userId}`
      );
      return userId || null;
    }

    // Get the most recent updates (including /start messages)
    const response = await axios.get<TelegramResponse>(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`,
      {
        params: {
          limit: 100, // Get more updates to increase chances of finding the user
          timeout: 10, // Shorter timeout for better UX
        },
      }
    );

    const { data } = response;

    if (!data.ok) {
      console.error("Error from Telegram API:", data);
      return null;
    }

    if (!data.result || !data.result.length) {
      console.log(
        "No updates received from Telegram. The bot may not have any recent messages."
      );
      return null;
    }

    // Log for debugging
    console.log(`Found ${data.result.length} updates from Telegram`);
    console.log("First few updates:", JSON.stringify(data.result.slice(0, 2)));

    // Process and cache all users from the updates for future lookups
    for (const update of data.result) {
      if (update.message?.from?.username) {
        const updateUsername = update.message.from.username.toLowerCase();
        const userId = update.message.from.id;
        console.log(`Caching user: ${updateUsername} with ID: ${userId}`);
        recentTelegramUsers.set(updateUsername, userId);
      }
    }

    // Now check if our target username is in the updates
    if (recentTelegramUsers.has(normalizedUsername)) {
      const userId = recentTelegramUsers.get(normalizedUsername);
      console.log(`Found username ${username} with user ID: ${userId}`);
      return userId || null;
    }

    console.log(`No matching username found for: ${username}`);
    return null;
  } catch (error) {
    console.error("Error verifying Telegram user:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
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

// Set up the endpoints
telegramRouter.get("/verify", handleVerifyTelegramRequest);

// Add manual update endpoint to force-register a user
telegramRouter.post("/manual-update", (req: Request, res: Response) => {
  try {
    const { username, userId } = req.body;

    if (!username || !userId) {
      res.status(400).json({ error: "Username and userId are required" });
      return;
    }

    const normalizedUsername = String(username).toLowerCase().trim();
    const parsedUserId = Number(userId);

    if (isNaN(parsedUserId)) {
      res.status(400).json({ error: "userId must be a number" });
      return;
    }

    // Update the cache
    recentTelegramUsers.set(normalizedUsername, parsedUserId);
    console.log(
      `Manually added user ${username} with ID ${parsedUserId} to cache`
    );

    res.status(200).json({
      success: true,
      message: `User ${username} with ID ${parsedUserId} added to cache`,
      cached_users: Array.from(recentTelegramUsers.entries()).map(
        ([username, id]) => ({ username, id })
      ),
    });
  } catch (error) {
    console.error("Error in manual update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Debug endpoint to check bot status and recent users
telegramRouter.get("/debug", async (req: Request, res: Response) => {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!TELEGRAM_BOT_TOKEN) {
      res.status(500).json({
        error: "TELEGRAM_BOT_TOKEN is not set in environment variables",
      });
      return;
    }

    // First, check if the bot token is valid by getting bot info
    const botInfoResponse = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );

    if (!botInfoResponse.data.ok) {
      res.status(401).json({
        error: "Invalid Telegram bot token",
        details: botInfoResponse.data,
      });
      return;
    }

    const botInfo = botInfoResponse.data.result;

    // Now get recent updates to see who has interacted with the bot
    const updatesResponse = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`,
      { params: { limit: 100 } }
    );

    const updates = updatesResponse.data.result || [];

    // Extract unique users who have interacted with the bot
    const users = new Map();
    updates.forEach((update: TelegramUpdate) => {
      if (update.message?.from) {
        const user = update.message.from;
        users.set(user.id, {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          message_count: (users.get(user.id)?.message_count || 0) + 1,
          last_message: update.message.text,
        });
      }
    });

    // Get cached users
    const cachedUsers = Array.from(recentTelegramUsers.entries()).map(
      ([username, id]) => ({ username, id })
    );

    res.status(200).json({
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name,
        is_bot: botInfo.is_bot,
      },
      update_count: updates.length,
      users: Array.from(users.values()),
      cached_users: cachedUsers,
      raw_updates: updates.slice(0, 5), // Include the first 5 raw updates for debugging
    });
  } catch (error) {
    console.error("Error checking bot status:", error);
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: "Error communicating with Telegram API",
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
      });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router to be used in index.ts
export default telegramRouter;
