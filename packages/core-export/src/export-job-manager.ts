/**
 * ExportJob state machine and manager
 */

import {
  createExportJob,
  createAppError,
  type ExportJob,
  type ExportJobStatus,
  type ExportParams,
  type PaginationResult,
} from "@chat2poster/core-schema";
import type { ExportResult } from "./exporter";
import type { MultiPageExportResult } from "./multi-page-exporter";
import type { ZipResult } from "./zip-packager";

/**
 * Event types emitted by the ExportJobManager
 */
export type ExportJobEventType =
  | "status-change"
  | "progress-update"
  | "page-complete"
  | "complete"
  | "error"
  | "cancelled";

/**
 * Event data for different event types
 */
export interface ExportJobEventData {
  "status-change": { previousStatus: ExportJobStatus; currentStatus: ExportJobStatus };
  "progress-update": { current: number; total: number; percentage: number };
  "page-complete": { pageIndex: number; result: ExportResult };
  complete: { result: MultiPageExportResult | ExportResult; zip?: ZipResult };
  error: { error: Error; code: string };
  cancelled: { partialResult?: MultiPageExportResult };
}

/**
 * Event listener type
 */
export type ExportJobEventListener<T extends ExportJobEventType> = (
  data: ExportJobEventData[T]
) => void;

/**
 * ExportJobManager - Manages the lifecycle of an export job
 */
export class ExportJobManager {
  private job: ExportJob;
  private abortController: AbortController | null = null;
  private listeners: Map<ExportJobEventType, Set<ExportJobEventListener<ExportJobEventType>>> =
    new Map();

  constructor(conversationId: string, params?: Partial<ExportParams>) {
    // Only include params if provided, otherwise let createExportJob use defaults
    const jobData: Parameters<typeof createExportJob>[0] = {
      id: crypto.randomUUID(),
      conversationId,
    };

    if (params !== undefined) {
      jobData.params = params as ExportParams;
    }

    this.job = createExportJob(jobData);
  }

  /**
   * Get the current job state
   */
  getJob(): ExportJob {
    return { ...this.job };
  }

  /**
   * Get the current status
   */
  getStatus(): ExportJobStatus {
    return this.job.status;
  }

  /**
   * Check if job can be started
   */
  canStart(): boolean {
    return this.job.status === "draft";
  }

  /**
   * Check if job is in progress
   */
  isRunning(): boolean {
    return this.job.status === "rendering";
  }

  /**
   * Check if job is complete (success or failed)
   */
  isComplete(): boolean {
    return this.job.status === "success" || this.job.status === "failed";
  }

  /**
   * Set pagination result
   */
  setPaginationResult(result: PaginationResult): void {
    this.job = {
      ...this.job,
      paginationResult: result,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Start the export job
   */
  start(): AbortSignal {
    if (!this.canStart()) {
      throw createAppError(
        "E-EXPORT-002",
        `Cannot start job in status: ${this.job.status}`
      );
    }

    const previousStatus = this.job.status;
    this.abortController = new AbortController();

    this.job = {
      ...this.job,
      status: "rendering",
      progress: 0,
      updatedAt: new Date().toISOString(),
    };

    this.emit("status-change", { previousStatus, currentStatus: "rendering" });

    return this.abortController.signal;
  }

  /**
   * Update progress
   */
  updateProgress(current: number, total: number): void {
    if (!this.isRunning()) {
      return;
    }

    const percentage = Math.round((current / total) * 100);

    this.job = {
      ...this.job,
      progress: percentage,
      updatedAt: new Date().toISOString(),
    };

    this.emit("progress-update", { current, total, percentage });
  }

  /**
   * Report page completion
   */
  reportPageComplete(pageIndex: number, result: ExportResult): void {
    if (!this.isRunning()) {
      return;
    }

    this.emit("page-complete", { pageIndex, result });
  }

  /**
   * Mark job as successful
   */
  complete(result: MultiPageExportResult | ExportResult, zip?: ZipResult): void {
    if (!this.isRunning()) {
      return;
    }

    const previousStatus = this.job.status;

    this.job = {
      ...this.job,
      status: "success",
      progress: 100,
      updatedAt: new Date().toISOString(),
    };

    this.abortController = null;

    this.emit("status-change", { previousStatus, currentStatus: "success" });
    this.emit("complete", { result, zip });
  }

  /**
   * Mark job as failed
   */
  fail(error: Error, code: string = "E-EXPORT-002"): void {
    const previousStatus = this.job.status;

    this.job = {
      ...this.job,
      status: "failed",
      error: {
        code,
        message: error.message,
        detail: error.stack,
      },
      updatedAt: new Date().toISOString(),
    };

    this.abortController = null;

    this.emit("status-change", { previousStatus, currentStatus: "failed" });
    this.emit("error", { error, code });
  }

  /**
   * Cancel the export job
   */
  cancel(partialResult?: MultiPageExportResult): void {
    if (!this.isRunning()) {
      return;
    }

    // Abort any pending operations
    this.abortController?.abort();
    this.abortController = null;

    const previousStatus = this.job.status;

    this.job = {
      ...this.job,
      status: "failed",
      error: {
        code: "E-EXPORT-008",
        message: "Export cancelled by user",
      },
      updatedAt: new Date().toISOString(),
    };

    this.emit("status-change", { previousStatus, currentStatus: "failed" });
    this.emit("cancelled", { partialResult });
  }

  /**
   * Reset job for retry (preserves params and pagination)
   */
  reset(): void {
    if (!this.isComplete()) {
      throw createAppError("E-EXPORT-002", "Cannot reset job that is not complete");
    }

    const previousStatus = this.job.status;

    this.job = {
      ...this.job,
      status: "draft",
      progress: undefined,
      error: undefined,
      updatedAt: new Date().toISOString(),
    };

    this.emit("status-change", { previousStatus, currentStatus: "draft" });
  }

  /**
   * Get the abort signal for cancellation
   */
  getAbortSignal(): AbortSignal | undefined {
    return this.abortController?.signal;
  }

  /**
   * Subscribe to events
   */
  on<T extends ExportJobEventType>(
    event: T,
    listener: ExportJobEventListener<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listeners = this.listeners.get(event)!;
    listeners.add(listener as ExportJobEventListener<ExportJobEventType>);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener as ExportJobEventListener<ExportJobEventType>);
    };
  }

  /**
   * Unsubscribe from events
   */
  off<T extends ExportJobEventType>(
    event: T,
    listener: ExportJobEventListener<T>
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener as ExportJobEventListener<ExportJobEventType>);
    }
  }

  /**
   * Emit an event
   */
  private emit<T extends ExportJobEventType>(
    event: T,
    data: ExportJobEventData[T]
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in export job event listener (${event}):`, error);
        }
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Create a new export job manager
 */
export function createExportJobManager(
  conversationId: string,
  params?: Partial<ExportParams>
): ExportJobManager {
  return new ExportJobManager(conversationId, params);
}
