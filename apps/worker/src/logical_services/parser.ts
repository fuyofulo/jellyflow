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
    console.log(`Fetching metadata for zapRun: ${zapRunId}`);
    const zapRun = await client.zapRun.findUnique({
      where: { id: zapRunId },
    });

    if (!zapRun) {
      throw new Error(`ZapRun with ID ${zapRunId} not found`);
    }

    console.log("ZapRun metadata:", zapRun.metadata);
    metadata = zapRun.metadata as Record<string, any>;
  }

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
        return typeof value === "string" ? value : JSON.stringify(value);
      } else {
        console.warn(
          `Array access out of bounds or not an array: ${trimmedVarName}`
        );
        return match;
      }
    }

    // Check if the variable exists in metadata
    if (metadata[trimmedVarName] !== undefined) {
      const value = metadata[trimmedVarName];
      console.log(`Found value for ${trimmedVarName}:`, value);
      console.log("hello world welcome 123");
      console.log(value);
      console.log("hello world welcome 123");
      return typeof value === "string" ? value : JSON.stringify(value);
    }

    // Handle nested paths like user.name
    if (trimmedVarName.includes(".")) {
      const parts = trimmedVarName.split(".");
      let value = metadata;
      let path = "";

      for (const part of parts) {
        path += (path ? "." : "") + part;
        if (value === undefined || value === null) {
          console.log(`Path ${path} not found in metadata`);
          return match;
        }
        value = value[part];
      }

      if (value !== undefined && value !== null) {
        console.log(`Found value for ${trimmedVarName} (nested):`, value);
        return typeof value === "string" ? value : JSON.stringify(value);
      }
    }

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
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    if (typeof obj === "string" && obj.includes("{{")) {
      return await parseTemplate(obj, zapRunId, zapRunMetadata);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(
      obj.map((item) => parseObject(item, zapRunId, zapRunMetadata))
    );
  }

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
