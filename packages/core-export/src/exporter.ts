/**
 * Core export engine using SnapDOM
 */

import {
  createAppError,
  type ExportScale,
  type ExportFormat,
  type AppError,
} from "@chat2poster/core-schema";
import { waitForResources } from "./resource-loader";

// ============================================================================
// Constants
// ============================================================================

/** Default timeout for font loading in milliseconds */
export const FONT_TIMEOUT_MS = 5000;

/** Default timeout for image loading in milliseconds */
export const IMAGE_TIMEOUT_MS = 10000;

/** Default JPEG quality (0-1) */
export const DEFAULT_JPEG_QUALITY = 0.92;

/** Maximum canvas dimension (conservative limit for Safari) */
export const MAX_CANVAS_DIMENSION = 16384;

/** Maximum total canvas pixels (~268 million) */
export const MAX_CANVAS_PIXELS = 268435456;

/**
 * Export options
 */
export interface ExportOptions {
  /** Scale factor for the output (1x, 2x, 3x) */
  scale: ExportScale;
  /** Output format */
  format: ExportFormat;
  /** JPEG quality (0-1), only used for JPEG format */
  quality?: number;
  /** Wait for fonts to load */
  waitForFonts?: boolean;
  /** Wait for images to load */
  waitForImages?: boolean;
  /** Font loading timeout in ms */
  fontTimeout?: number;
  /** Image loading timeout in ms */
  imageTimeout?: number;
  /** Background color (defaults to transparent for PNG) */
  backgroundColor?: string;
  /** Embed fonts for consistent rendering (default: true) */
  embedFonts?: boolean;
}

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  scale: 2,
  format: "png",
  quality: DEFAULT_JPEG_QUALITY,
  waitForFonts: true,
  waitForImages: true,
  fontTimeout: FONT_TIMEOUT_MS,
  imageTimeout: IMAGE_TIMEOUT_MS,
  embedFonts: true,
};

/**
 * Export result
 */
export interface ExportResult {
  /** The exported image as a Blob */
  blob: Blob;
  /** The exported image as a data URL */
  dataUrl: string;
  /** Width of the exported image in pixels */
  width: number;
  /** Height of the exported image in pixels */
  height: number;
  /** Metadata about the export */
  meta: {
    scale: ExportScale;
    format: string;
    exportedAt: string;
    resourceStatus: {
      fontsReady: boolean;
      imagesLoaded: number;
      imagesFailed: number;
    };
  };
}

/**
 * Get SnapDOM module
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- dynamic import requires typeof import()
async function getSnapDOM(): Promise<typeof import("@zumer/snapdom")> {
  try {
    return await import("@zumer/snapdom");
  } catch {
    throw createAppError(
      "E-EXPORT-002",
      "SnapDOM library not available. Ensure @zumer/snapdom is installed.",
    );
  }
}

/**
 * SnapDOM capture options for high-quality export
 */
interface SnapDOMCaptureOptions {
  scale: number;
  backgroundColor?: string;
  embedFonts?: boolean;
}

/**
 * Convert an element to a canvas using SnapDOM
 */
async function elementToCanvas(
  element: HTMLElement,
  options: SnapDOMCaptureOptions,
): Promise<HTMLCanvasElement> {
  const { snapdom } = await getSnapDOM();

  // Wait a frame to ensure all styles are computed
  await new Promise((resolve) => requestAnimationFrame(resolve));

  // Capture the element with high-quality settings
  const result = await snapdom(element, {
    // Scale multiplier for output resolution
    scale: options.scale,
    // Set dpr to 1 so scale fully controls output resolution
    dpr: 1,
    // Background color
    backgroundColor: options.backgroundColor,
    // Embed fonts for consistent text rendering (prevents misalignment)
    embedFonts: options.embedFonts ?? true,
    // Preserve outer transforms for accurate positioning (default: true)
    outerTransforms: true,
    // Keep shadows/blur/outline effects (default: false means keep them)
    outerShadows: false,
    // Enable fast mode for better performance
    fast: true,
    // Use full caching for better performance on repeated captures
    cache: "full",
  });

  return result.toCanvas();
}

/**
 * Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      mimeType,
      quality,
    );
  });
}

/**
 * Convert canvas to data URL
 */
function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality?: number,
): string {
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Export a single element to PNG
 */
export async function exportToPng(
  element: HTMLElement,
  options: Partial<ExportOptions> = {},
): Promise<ExportResult> {
  const opts: ExportOptions = {
    ...DEFAULT_EXPORT_OPTIONS,
    ...options,
    format: "png",
  };

  return exportElement(element, opts);
}

/**
 * Export a single element to JPEG
 */
export async function exportToJpeg(
  element: HTMLElement,
  options: Partial<ExportOptions> = {},
): Promise<ExportResult> {
  const opts: ExportOptions = {
    ...DEFAULT_EXPORT_OPTIONS,
    ...options,
    format: "jpeg",
  };

  return exportElement(element, opts);
}

/**
 * Core export function
 */
export async function exportElement(
  element: HTMLElement,
  options: ExportOptions,
): Promise<ExportResult> {
  // Wait for resources if requested
  let resourceStatus = {
    fontsReady: true,
    imagesLoaded: 0,
    imagesFailed: 0,
  };

  if (options.waitForFonts || options.waitForImages) {
    resourceStatus = await waitForResources(element, {
      fontTimeout: options.fontTimeout,
      imageTimeout: options.imageTimeout,
    });

    // Check for critical failures
    if (!resourceStatus.fontsReady) {
      throw createAppError(
        "E-EXPORT-003",
        "Fonts failed to load within timeout",
      );
    }

    if (resourceStatus.imagesFailed > 0) {
      // Log warning but don't fail - images might be optional
      console.warn(
        `${resourceStatus.imagesFailed} image(s) failed to load, proceeding with export`,
      );
    }
  }

  // Export using SnapDOM
  let canvas: HTMLCanvasElement;
  try {
    canvas = await elementToCanvas(element, {
      scale: options.scale,
      backgroundColor: options.backgroundColor,
      embedFonts: options.embedFonts,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    throw createAppError("E-EXPORT-002", `SnapDOM render failed: ${detail}`);
  }

  // Convert to output format
  const blob = await canvasToBlob(canvas, options.format, options.quality);
  const dataUrl = canvasToDataUrl(canvas, options.format, options.quality);

  return {
    blob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    meta: {
      scale: options.scale,
      format: options.format,
      exportedAt: new Date().toISOString(),
      resourceStatus,
    },
  };
}

/**
 * Check if canvas size is within browser limits
 * Different browsers have different maximum canvas sizes
 */
export function isCanvasSizeValid(width: number, height: number): boolean {
  if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
    return false;
  }

  if (width * height > MAX_CANVAS_PIXELS) {
    return false;
  }

  return true;
}

/**
 * Validate export parameters before attempting export
 */
export function validateExportParams(
  element: HTMLElement,
  options: ExportOptions,
): { valid: boolean; error?: AppError } {
  const rect = element.getBoundingClientRect();
  const scaledWidth = rect.width * options.scale;
  const scaledHeight = rect.height * options.scale;

  if (!isCanvasSizeValid(scaledWidth, scaledHeight)) {
    return {
      valid: false,
      error: createAppError(
        "E-EXPORT-007",
        `Canvas size ${scaledWidth}x${scaledHeight} exceeds browser limits`,
      ),
    };
  }

  return { valid: true };
}
