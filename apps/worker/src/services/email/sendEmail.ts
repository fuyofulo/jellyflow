import { parseObject } from "../../logical_services/parser";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), "../../../../.env") });

// Create a transporter with Gmail configuration
const createTransporter = () => {
  const email = process.env.EMAIL;
  const appPassword = process.env.APP_PASSWORD;

  if (!email || !appPassword) {
    throw new Error(
      "Missing Gmail configuration: EMAIL and APP_PASSWORD must be set in .env"
    );
  }

  // Log configuration (without credentials)
  console.log(`[EMAIL SERVICE] Initializing Gmail service for: ${email}`);

  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: appPassword,
    },
  });
};

// Lazy initialization of the transporter
let transporter: nodemailer.Transporter;

/**
 * Sends a mail using Gmail
 */
async function sendMail(
  to: string | string[],
  subject: string,
  body: string,
  fromName: string = "Zap Automation"
) {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      transporter = createTransporter();
    }

    const email = process.env.EMAIL;
    if (!email) {
      throw new Error("EMAIL environment variable must be set");
    }

    // Convert single email to array if needed
    const recipients = Array.isArray(to) ? to : [to];

    console.log(`[EMAIL SERVICE] Sending email to: ${recipients.join(", ")}`);
    console.log(`[EMAIL SERVICE] Subject: ${subject}`);

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: {
        name: fromName,
        address: email,
      },
      to: recipients.join(", "),
      subject,
      text: body, // Plain text version
      html: body, // HTML version (if body contains HTML)
    });

    console.log(`[EMAIL SERVICE] Email sent from: ${fromName} <${email}>`);
    console.log(`[EMAIL SERVICE] Email sent successfully: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("[EMAIL SERVICE] Error sending email:", error);
    throw error;
  }
}

/**
 * Sends an email based on the provided metadata
 * This is the main function used by the action system
 *
 * @param metadata The email data including recipients, subject, body, etc.
 * @param zapRunId The ID of the zapRun for template parsing
 * @param zapRunMetadata Optional metadata from the zapRun, to avoid fetching again
 * @returns ActionResult indicating success or failure
 */
export async function sendEmail(
  metadata: any,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    // Extract email data from metadata
    const { data } = metadata;

    console.log(
      "[EMAIL] Original data before parsing:",
      JSON.stringify(data, null, 2)
    );

    if (zapRunMetadata) {
      console.log("[EMAIL] Using provided zapRunMetadata for parsing");
    } else {
      console.log(
        "[EMAIL] No zapRunMetadata provided, parser will fetch from database"
      );
    }

    console.log("[EMAIL] Starting template parsing with zapRunId:", zapRunId);

    // Parse all template variables in the data
    const parsedData = await parseObject(data, zapRunId, zapRunMetadata);
    console.log(parsedData);

    console.log(
      "[EMAIL] Parsed data after template replacement:",
      JSON.stringify(parsedData, null, 2)
    );

    const { recipients, subject, body, fromName } = parsedData;
    console.log("hello world welcome 123");
    console.log(body);
    console.log("hello world welcome 123");

    if (
      !recipients ||
      (!Array.isArray(recipients) && typeof recipients !== "string") ||
      (Array.isArray(recipients) && recipients.length === 0)
    ) {
      throw new Error("No recipients specified");
    }

    if (!subject) {
      throw new Error("Email subject is required");
    }

    if (!body) {
      throw new Error("Email body is required");
    }

    // Log what we're sending
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    console.log(`[EMAIL] Sending email to ${recipientList.join(", ")}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body length: ${body.length} characters`);

    // Send the actual email
    const mailResult = await sendMail(
      recipients,
      subject,
      body,
      fromName || "Jelly Flow"
    );

    console.log(
      `[EMAIL] Email sent successfully with messageId: ${mailResult.messageId}`
    );

    return {
      success: true,
      message: "Email sent successfully",
      data: {
        recipients,
        subject,
        messageId: mailResult.messageId,
        sentAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
