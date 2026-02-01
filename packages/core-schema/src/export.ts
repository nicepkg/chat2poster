import { z } from "zod";

/**
 * Default values for export parameters.
 * These are the single source of truth - use these constants instead of hardcoding values.
 */
export const EXPORT_DEFAULTS = {
  SCALE: 2 as const,
  CANVAS_PRESET: "portrait" as const,
  CANVAS_WIDTH_PX: 1080,
  MAX_PAGE_HEIGHT_PX: 4096,
  OUTPUT_MODE: "single" as const,
} as const;

/**
 * Export image format
 */
export const ExportFormat = z.enum(["png", "jpeg"]);
export type ExportFormat = z.infer<typeof ExportFormat>;

/**
 * Canvas width preset
 */
export const CanvasPreset = z.enum([
  "square", // 1080x1080
  "portrait", // 1080x1350
  "story", // 1080x1920
  "wide", // 1920x1080
  "custom",
]);
export type CanvasPreset = z.infer<typeof CanvasPreset>;

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
 */
export const ExportParams = z
  .object({
    scale: ExportScale.default(EXPORT_DEFAULTS.SCALE),
    canvasPreset: CanvasPreset.default(EXPORT_DEFAULTS.CANVAS_PRESET),
    canvasWidthPx: z
      .number()
      .int()
      .positive()
      .default(EXPORT_DEFAULTS.CANVAS_WIDTH_PX),
    maxPageHeightPx: z
      .number()
      .int()
      .min(2000)
      .max(10000)
      .default(EXPORT_DEFAULTS.MAX_PAGE_HEIGHT_PX),
    outputMode: OutputMode.default(EXPORT_DEFAULTS.OUTPUT_MODE),
  })
  .strict();
export type ExportParams = z.infer<typeof ExportParams>;

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
