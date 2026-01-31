/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Generate a unique filename for export
 */
export function generateExportFilename(
  prefix = "chat2poster",
  extension = "png",
  pageNumber?: number,
): string {
  const date = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5).replace(":", "");
  const page =
    pageNumber !== undefined ? `_${String(pageNumber).padStart(3, "0")}` : "";
  return `${prefix}_${date}_${time}${page}.${extension}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
