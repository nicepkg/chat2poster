import { z } from "zod";

/**
 * Error codes for parsing operations
 */
export const ParseErrorCode = z.enum([
  "E-PARSE-001", // Adapter not found
  "E-PARSE-002", // DOM structure changed
  "E-PARSE-003", // Share link invalid
  "E-PARSE-004", // Share link fetch failed
  "E-PARSE-005", // No messages found
  "E-PARSE-006", // Invalid input format
  "E-PARSE-007", // Rate limited
]);
export type ParseErrorCode = z.infer<typeof ParseErrorCode>;

/**
 * Error codes for export operations
 */
export const ExportErrorCode = z.enum([
  "E-EXPORT-001", // No messages selected
  "E-EXPORT-002", // Render failed
  "E-EXPORT-003", // Font loading failed
  "E-EXPORT-004", // Image loading failed
  "E-EXPORT-005", // ZIP packaging failed
  "E-EXPORT-006", // Download failed
  "E-EXPORT-007", // Canvas too large
  "E-EXPORT-008", // Operation cancelled
]);
export type ExportErrorCode = z.infer<typeof ExportErrorCode>;

/**
 * All error codes
 */
export const ErrorCode = z.union([ParseErrorCode, ExportErrorCode]);
export type ErrorCode = z.infer<typeof ErrorCode>;

/**
 * Base error structure
 */
export const AppError = z
  .object({
    code: ErrorCode,
    message: z.string(),
    detail: z.string().optional(),
    timestamp: z.string().datetime(),
  })
  .strict();
export type AppError = z.infer<typeof AppError>;

/**
 * Error messages for user display
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  "E-PARSE-001": "Cannot find a parser for this page",
  "E-PARSE-002": "Page structure has changed, parser needs update",
  "E-PARSE-003": "Invalid share link format",
  "E-PARSE-004": "Failed to fetch share link content",
  "E-PARSE-005": "No messages found in conversation",
  "E-PARSE-006": "Invalid input format",
  "E-PARSE-007": "Rate limited, please try again later",
  "E-EXPORT-001": "Please select at least one message",
  "E-EXPORT-002": "Failed to render image",
  "E-EXPORT-003": "Failed to load fonts",
  "E-EXPORT-004": "Failed to load images",
  "E-EXPORT-005": "Failed to create ZIP file",
  "E-EXPORT-006": "Failed to download file",
  "E-EXPORT-007": "Canvas size too large",
  "E-EXPORT-008": "Export cancelled",
};

/**
 * Create an application error
 */
export function createAppError(
  code: ErrorCode,
  detail?: string
): AppError {
  return AppError.parse({
    code,
    message: ERROR_MESSAGES[code],
    detail,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Type guard to check if error is a parse error
 */
export function isParseError(error: AppError): boolean {
  return error.code.startsWith("E-PARSE");
}

/**
 * Type guard to check if error is an export error
 */
export function isExportError(error: AppError): boolean {
  return error.code.startsWith("E-EXPORT");
}
