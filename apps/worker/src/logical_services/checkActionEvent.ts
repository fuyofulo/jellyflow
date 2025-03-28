import { sendEmail } from "../services/email/sendEmail";

// Interface for action handlers
interface ActionHandler {
  (
    metadata: any,
    zapRunId: string,
    zapRunMetadata?: Record<string, any>
  ): Promise<ActionResult>;
}

// Interface for action results
interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

// add actions and functions here
const actionHandlers: Record<string, ActionHandler> = {
  sendEmail: sendEmail,
};

/**
 * Process an action based on its event type
 *
 * @param actionEvent The type of action to perform (e.g., 'sendEmail')
 * @param metadata The metadata needed to perform the action
 * @param zapRunId The ID of the zapRun for template parsing
 * @param zapRunMetadata Optional metadata from the zapRun, to avoid fetching again
 * @returns ActionResult with success status and any relevant data
 */
export async function processAction(
  actionEvent: string,
  metadata: any,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<ActionResult> {
  console.log(`Processing action event: ${actionEvent}`);

  // Check if we have a handler for this action type
  const handler = actionHandlers[actionEvent];

  if (!handler) {
    console.error(`No handler found for action event: ${actionEvent}`);
    return {
      success: false,
      message: `Unsupported action event: ${actionEvent}`,
    };
  }

  try {
    // Call the appropriate handler with the metadata, zapRunId, and zapRunMetadata
    const result = await handler(metadata, zapRunId, zapRunMetadata);
    console.log(`Action ${actionEvent} processed with result:`, result);
    return result;
  } catch (error) {
    console.error(`Error processing action ${actionEvent}:`, error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// For easy reference, export a list of all supported action events
export const supportedActionEvents = Object.keys(actionHandlers);
