require("dotenv").config();
const express = require("express");
const axios = require("axios");
import { parseObject } from "../../logical_services/parser";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env"
  );
}

/**
 * Base function to make Telegram API calls
 * @param method The Telegram API method to call
 * @param data The data to send with the request
 * @returns API response
 */
export async function callTelegramAPI(method: string, data: any = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`;

  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Error calling Telegram API (${method}):`,
      error.response?.data || error
    );
    throw error;
  }
}

/**
 * Sends a message to a Telegram chat
 */
export async function sendTelegramMessage(chatId: string, message: string) {
  console.log(`✅ Sending message to chat ID: ${chatId}`);
  return await callTelegramAPI("sendMessage", {
    chat_id: chatId,
    text: message,
  });
}

/**
 * Gets updates from Telegram
 */
export async function getTelegramUpdates() {
  console.log("✅ Getting Telegram updates");
  return await callTelegramAPI("getUpdates");
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
