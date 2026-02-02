import { z } from "zod";

/**
 * Device type for desktop width preset
 * - mobile: Phone-sized export (390px - iPhone 14 Pro)
 * - tablet: Tablet-sized export (768px - iPad)
 * - desktop: Desktop-sized export (1200px)
 */
export const DeviceType = z.enum(["mobile", "tablet", "desktop"]);
export type DeviceType = z.infer<typeof DeviceType>;

/**
 * Device width presets in pixels
 * These define the desktop (canvas) width for each device type
 */
export const DEVICE_WIDTHS: Record<DeviceType, number> = {
  mobile: 390,
  tablet: 768,
  desktop: 1200,
} as const;

/**
 * Available export scale factors
 */
export const EXPORT_SCALES = [1, 2, 3] as const;

/**
 * Default values for export parameters.
 * These are the single source of truth - use these constants instead of hardcoding values.
 */
export const EXPORT_DEFAULTS = {
  SCALE: 2 as const,
  DEVICE_TYPE: "tablet" as const,
  MAX_PAGE_HEIGHT_PX: 4096,
  OUTPUT_MODE: "single" as const,
} as const;

/**
 * Export image format
 */
export const ExportFormat = z.enum(["png", "jpeg"]);
export type ExportFormat = z.infer<typeof ExportFormat>;

/**
 * Export scale factor
 */
export const ExportScale = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type ExportScale = z.infer<typeof ExportScale>;

/**
 * Output mode for export
 */
export const OutputMode = z.enum(["single", "multi-zip"]);
export type OutputMode = z.infer<typeof OutputMode>;

/**
 * Export parameters
 *
 * Desktop width is determined by deviceType:
 * - mobile: 390px (iPhone 14 Pro)
 * - tablet: 768px (iPad)
 * - desktop: 1200px
 *
 * Window width = Desktop width - (canvasPaddingPx × 2)
 */
export const ExportParams = z
  .object({
    /** Export scale factor (1x, 2x, 3x) */
    scale: ExportScale.default(EXPORT_DEFAULTS.SCALE),
    /** Device type determines desktop width */
    deviceType: DeviceType.default(EXPORT_DEFAULTS.DEVICE_TYPE),
    /** Maximum page height before auto-pagination */
    maxPageHeightPx: z
      .number()
      .int()
      .min(2000)
      .max(10000)
      .default(EXPORT_DEFAULTS.MAX_PAGE_HEIGHT_PX),
    /** Output mode: single PNG or multi-page ZIP */
    outputMode: OutputMode.default(EXPORT_DEFAULTS.OUTPUT_MODE),
  })
  .strict();
export type ExportParams = z.infer<typeof ExportParams>;

/**
 * Get desktop width in pixels for a device type
 */
export function getDesktopWidth(deviceType: DeviceType): number {
  return DEVICE_WIDTHS[deviceType];
}

/**
 * Export job status
 */
export const ExportJobStatus = z.enum([
  "draft",
  "rendering",
  "success",
  "failed",
]);
export type ExportJobStatus = z.infer<typeof ExportJobStatus>;

/**
 * Pagination result - how messages are split into pages
 */
export const PaginationResult = z
  .object({
    pages: z.array(z.array(z.string().uuid())),
    totalPages: z.number().int().positive(),
  })
  .strict();
export type PaginationResult = z.infer<typeof PaginationResult>;

/**
 * Export error details
 */
export const ExportError = z
  .object({
    code: z.string(),
    message: z.string(),
    detail: z.string().optional(),
  })
  .strict();
export type ExportError = z.infer<typeof ExportError>;

/**
 * Export job tracking
 */
export const ExportJob = z
  .object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    params: ExportParams,
    paginationResult: PaginationResult.optional(),
    status: ExportJobStatus,
    progress: z.number().min(0).max(100).optional(),
    error: ExportError.optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .refine(
    (job) => {
      // JOB-001: multi-zip requires multiple pages
      if (
        job.params.outputMode === "multi-zip" &&
        job.paginationResult &&
        job.paginationResult.totalPages <= 1
      ) {
        return false;
      }
      return true;
    },
    { message: "multi-zip mode requires more than 1 page" },
  )
  .refine(
    (job) => {
      // JOB-002: failed status must have error
      if (job.status === "failed" && !job.error) {
        return false;
      }
      return true;
    },
    { message: "Failed export job must include error details" },
  );
export type ExportJob = z.infer<typeof ExportJob>;

/**
 * Create a new export job
 */
export function createExportJob(
  partial: Pick<ExportJob, "id" | "conversationId"> & Partial<ExportJob>,
): ExportJob {
  const now = new Date().toISOString();
  return ExportJob.parse({
    params: {},
    status: "draft",
    createdAt: now,
    updatedAt: now,
    ...partial,
  });
}
