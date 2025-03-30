require("dotenv").config();
const express = require("express");
const axios = require("axios");
import { parseObject } from "../../logical_services/parser";

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env"
  );
}

export async function sendTelegramMessage(chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
    });

    console.log("✅ Message sent:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error sending message:", error.response?.data || error);
    throw error;
  }
}

interface ActionData {
  id: string;
  zapId: string;
  actionId: string;
  metadata: {
    userId: number;
    username: string;
    isVerified: boolean;
    actionEvent: string;
    description: string;
    updateMessage: string;
    webhookDataReceived: boolean;
    webhookResponseData: any;
    updateMessageVariables: string[];
  };
  sortingOrder: number;
  type: {
    id: string;
    name: string;
  };
}

export async function processTelegramAction(actionData: ActionData) {
  const { metadata } = actionData;

  if (metadata.actionEvent === "getTelegramUpdate") {
    const chatId = metadata.userId.toString();
    const message = metadata.updateMessage;

    console.log(
      `Processing telegram update for user ${metadata.username} (${chatId})`
    );
    return await sendTelegramMessage(chatId, message);
  } else {
    console.log(`Skipping action with event: ${metadata.actionEvent}`);
    return null;
  }
}

/**
 * Sends a Telegram message based on the provided metadata
 * This is the main function used by the action system
 *
 * @param metadata The Telegram data including userId and message
 * @param zapRunId The ID of the zapRun for template parsing
 * @param zapRunMetadata Optional metadata from the zapRun, to avoid fetching again
 * @returns ActionResult indicating success or failure
 */
export async function getTelegramUpdate(
  metadata: any,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    console.log(
      "[TELEGRAM] Original metadata:",
      JSON.stringify(metadata, null, 2)
    );

    // Extract userId directly from the action metadata
    const userId = metadata.userId;
    let updateMessage = metadata.updateMessage;

    if (!userId) {
      throw new Error("No userId specified for Telegram message");
    }

    if (!updateMessage) {
      throw new Error("Telegram message content is required");
    }

    // Only parse the message template if needed
    if (zapRunMetadata && updateMessage.includes("{{")) {
      console.log(
        "[TELEGRAM] Using provided zapRunMetadata for parsing message"
      );
      console.log(
        "[TELEGRAM] Starting template parsing with zapRunId:",
        zapRunId
      );

      // Parse only the message template
      const parsedData = await parseObject(
        { updateMessage },
        zapRunId,
        zapRunMetadata
      );
      updateMessage = parsedData.updateMessage;

      console.log("[TELEGRAM] Parsed message:", updateMessage);
    }

    // Convert userId to string if it's a number
    const chatId = userId.toString();

    console.log(`[TELEGRAM] Sending message to user ID: ${chatId}`);
    console.log(`[TELEGRAM] Message: ${updateMessage}`);
    console.log(
      `[TELEGRAM] Message length: ${updateMessage.length} characters`
    );

    // Send the actual Telegram message
    const result = await sendTelegramMessage(chatId, updateMessage);

    console.log(
      `[TELEGRAM] Message sent successfully with message_id: ${result.result.message_id}`
    );

    return {
      success: true,
      message: "Telegram message sent successfully",
      data: {
        userId: chatId,
        messageId: result.result.message_id,
        sentAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[TELEGRAM] Failed to send message:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown Telegram error",
    };
  }
}

// Send a test message when the server starts
sendTelegramMessage(TELEGRAM_CHAT_ID, "🚀 Bot is now running!");

app.listen(7000, () => console.log("✅ Server running on port 7000"));
