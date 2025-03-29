import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), "../../../.env") });

// Create a transporter with Gmail configuration
const createTransporter = () => {
  const email = process.env.EMAIL;
  const appPassword = process.env.APP_PASSWORD;

  if (!email || !appPassword) {
    throw new Error(
      "Missing Gmail configuration: EMAIL and APP_PASSWORD must be set in .env"
    );
  }

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
 * Sends a verification email to the user
 * @param to Recipient email address
 * @param subject Email subject
 * @param body Email body (HTML)
 * @param fromName Sender name
 * @returns Promise with email send result
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  fromName: string = "Your App"
): Promise<{ success: boolean; message?: string }> {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      transporter = createTransporter();
    }

    const email = process.env.EMAIL;
    if (!email) {
      throw new Error("EMAIL environment variable must be set");
    }

    console.log(`[EMAIL] Sending email to: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);

    // Send mail
    const info = await transporter.sendMail({
      from: {
        name: fromName,
        address: email,
      },
      to: to,
      subject,
      text: body.replace(/<[^>]*>/g, ""), // Plain text version (stripped HTML)
      html: body, // HTML version
    });

    console.log(`[EMAIL] Email sent successfully: ${info.messageId}`);
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
