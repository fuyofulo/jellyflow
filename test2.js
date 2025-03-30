require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(chatId, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
    });

    console.log("✅ Message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending message:", error.response?.data || error);
  }
}


// Send a test message when the server starts
sendTelegramMessage(TELEGRAM_CHAT_ID, "🚀 Bot is now running!");

app.listen(7000, () => console.log("✅ Server running on port 7000"));
