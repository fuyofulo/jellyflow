import { sendEmail } from "../services/email/sendEmail";
import { getTelegramUpdate } from "../services/telegram/getTelegramUpdate";

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
  getTelegramUpdate: getTelegramUpdate,
};

// For easy reference, export a list of all supported action events
export const supportedActionEvents = Object.keys(actionHandlers);

/**
 * Process an action based on its event type
 *
 * @param actionEvent The type of action to perform (e.g., 'sendEmail')
 * @param metadata The metadata needed to perform the action
 * @param zapRunId The ID of the zapRun for template parsing
 * @param zapRunMetadata Optional metadata from the zapRun, to avoid fetching again
 * @returns ActionResult with success status and any relevant data
 */
export const processAction = async (
  actionEvent: string,
  metadata: any,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<ActionResult> => {
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
};
