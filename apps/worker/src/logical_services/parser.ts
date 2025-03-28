import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

/**
 * Parses a string with template variables ({{var}}) and replaces them with values from zapRun metadata
 *
 * @param template The string containing template variables like "Hello {{name}}"
 * @param zapRunId The ID of the zapRun to fetch metadata from
 * @param zapRunMetadata Optional metadata to use instead of fetching from database
 * @returns The parsed string with all variables replaced with their values
 */
export async function parseTemplate(
  template: string,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<string> {
  // Use provided metadata or fetch from database
  let metadata: Record<string, any>;

  if (zapRunMetadata) {
    console.log(`Using provided metadata for zapRun: ${zapRunId}`);
    metadata = zapRunMetadata;
  } else {
    // Fetch the ZapRun metadata with additional logging
    console.log(`Fetching metadata for zapRun: ${zapRunId}`);
    const zapRun = await client.zapRun.findUnique({
      where: { id: zapRunId },
    });

    if (!zapRun) {
      throw new Error(`ZapRun with ID ${zapRunId} not found`);
    }

    // Log the metadata to debug
    console.log("ZapRun metadata:", zapRun.metadata);
    metadata = zapRun.metadata as Record<string, any>;
  }

  // Replace all {{var}} occurrences with their values from metadata
  return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedVarName = varName.trim();
    console.log(`Replacing template variable: ${trimmedVarName}`);

    // Check for array notation like deserts[0]
    const arrayMatch = trimmedVarName.match(/^([^\[]+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const arrayIndex = parseInt(arrayMatch[2]);

      if (
        metadata[arrayName] &&
        Array.isArray(metadata[arrayName]) &&
        arrayIndex >= 0 &&
        arrayIndex < metadata[arrayName].length
      ) {
        const value = metadata[arrayName][arrayIndex];
        console.log(`Found array value for ${trimmedVarName}:`, value);
        return value.toString();
      } else {
        console.warn(
          `Array access out of bounds or not an array: ${trimmedVarName}`
        );
        return match;
      }
    }

    // Check if the variable exists in metadata
    if (metadata[trimmedVarName] !== undefined) {
      console.log(
        `Found value for ${trimmedVarName}:`,
        metadata[trimmedVarName]
      );
      return metadata[trimmedVarName].toString();
    }

    // If nested object path like "user.name", traverse the object
    if (trimmedVarName.includes(".")) {
      const parts = trimmedVarName.split(".");
      let value = metadata;
      let path = "";

      for (const part of parts) {
        path += (path ? "." : "") + part;
        if (value === undefined || value === null) {
          console.log(`Path ${path} not found in metadata`);
          return match; // Keep original if path doesn't exist
        }
        value = value[part];
      }

      if (value !== undefined && value !== null) {
        console.log(`Found value for ${trimmedVarName} (nested):`, value);
        return value.toString();
      }
    }

    // If variable not found, return the original template marker
    console.warn(
      `⚠️ Variable ${trimmedVarName} not found in metadata for zapRun ${zapRunId}`
    );
    return match;
  });
}

/**
 * Parses all template variables in an object recursively
 *
 * @param obj The object or value containing template variables
 * @param zapRunId The ID of the zapRun to fetch metadata from
 * @param zapRunMetadata Optional metadata to use instead of fetching from database
 * @returns A new object with all template variables replaced with their values
 */
export async function parseObject(
  obj: any,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<any> {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj !== "object") {
    if (typeof obj === "string" && obj.includes("{{")) {
      return await parseTemplate(obj, zapRunId, zapRunMetadata);
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return Promise.all(
      obj.map((item) => parseObject(item, zapRunId, zapRunMetadata))
    );
  }

  // Handle objects
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[key] = await parseObject(obj[key], zapRunId, zapRunMetadata);
  }

  return result;
}

/**
 * Helper function to parse a specific field from action metadata
 *
 * @param actionMetadata The action metadata containing the field
 * @param fieldName The name of the field to parse
 * @param zapRunId The ID of the zapRun to fetch metadata from
 * @param zapRunMetadata Optional metadata to use instead of fetching from database
 * @returns The parsed field value
 */
export async function parseField(
  actionMetadata: any,
  fieldName: string,
  zapRunId: string,
  zapRunMetadata?: Record<string, any>
): Promise<any> {
  if (!actionMetadata || !actionMetadata[fieldName]) {
    return null;
  }

  return parseObject(actionMetadata[fieldName], zapRunId, zapRunMetadata);
}
