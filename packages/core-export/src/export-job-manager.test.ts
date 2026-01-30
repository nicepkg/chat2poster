import { describe, it, expect, vi } from "vitest";
import { ExportJobManager, createExportJobManager } from "./export-job-manager";

// Use a valid UUID for testing
const TEST_CONVERSATION_ID = "00000000-0000-0000-0000-000000000001";

describe("ExportJobManager", () => {
  describe("initial state", () => {
    it("should create job with draft status", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      expect(manager.getStatus()).toBe("draft");
    });

    it("should store conversation ID", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      expect(manager.getJob().conversationId).toBe(TEST_CONVERSATION_ID);
    });

    it("should accept initial params", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID, { scale: 3 });
      expect(manager.getJob().params.scale).toBe(3);
    });
  });

  describe("state transitions", () => {
    it("should transition from draft to rendering on start", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      expect(manager.getStatus()).toBe("rendering");
    });

    it("should transition to success on complete", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      manager.complete({
        pages: [],
        totalPages: 0,
        cancelled: false,
        completedAt: new Date().toISOString(),
      });
      expect(manager.getStatus()).toBe("success");
    });

    it("should transition to failed on fail", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      manager.fail(new Error("Test error"));
      expect(manager.getStatus()).toBe("failed");
    });

    it("should not allow starting a non-draft job", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      expect(() => manager.start()).toThrow();
    });

    it("should allow reset after completion", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      manager.complete({
        pages: [],
        totalPages: 0,
        cancelled: false,
        completedAt: new Date().toISOString(),
      });
      manager.reset();
      expect(manager.getStatus()).toBe("draft");
    });
  });

  describe("progress tracking", () => {
    it("should update progress", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      manager.updateProgress(5, 10);
      expect(manager.getJob().progress).toBe(50);
    });

    it("should not update progress when not running", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.updateProgress(5, 10);
      expect(manager.getJob().progress).toBeUndefined();
    });
  });

  describe("cancellation", () => {
    it("should cancel running job", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      manager.start();
      manager.cancel();
      expect(manager.getStatus()).toBe("failed");
      expect(manager.getJob().error?.code).toBe("E-EXPORT-008");
    });

    it("should return abort signal on start", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const signal = manager.start();
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it("should abort signal on cancel", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const signal = manager.start();
      manager.cancel();
      expect(signal.aborted).toBe(true);
    });
  });

  describe("event handling", () => {
    it("should emit status-change event", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      manager.on("status-change", handler);

      manager.start();

      expect(handler).toHaveBeenCalledWith({
        previousStatus: "draft",
        currentStatus: "rendering",
      });
    });

    it("should emit progress-update event", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      manager.on("progress-update", handler);

      manager.start();
      manager.updateProgress(3, 10);

      expect(handler).toHaveBeenCalledWith({
        current: 3,
        total: 10,
        percentage: 30,
      });
    });

    it("should emit complete event", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      manager.on("complete", handler);

      const result = {
        pages: [],
        totalPages: 0,
        cancelled: false,
        completedAt: new Date().toISOString(),
      };

      manager.start();
      manager.complete(result);

      expect(handler).toHaveBeenCalledWith({ result, zip: undefined });
    });

    it("should emit error event on fail", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      manager.on("error", handler);

      const error = new Error("Test error");
      manager.start();
      manager.fail(error, "E-EXPORT-002");

      expect(handler).toHaveBeenCalledWith({ error, code: "E-EXPORT-002" });
    });

    it("should emit cancelled event", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      manager.on("cancelled", handler);

      manager.start();
      manager.cancel();

      expect(handler).toHaveBeenCalled();
    });

    it("should return unsubscribe function", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      const unsubscribe = manager.on("status-change", handler);

      unsubscribe();
      manager.start();

      expect(handler).not.toHaveBeenCalled();
    });

    it("should allow removing listener with off", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler = vi.fn();
      manager.on("status-change", handler);
      manager.off("status-change", handler);

      manager.start();

      expect(handler).not.toHaveBeenCalled();
    });

    it("should remove all listeners", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      manager.on("status-change", handler1);
      manager.on("progress-update", handler2);

      manager.removeAllListeners();
      manager.start();
      manager.updateProgress(1, 2);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("utility methods", () => {
    it("should correctly report canStart", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      expect(manager.canStart()).toBe(true);

      manager.start();
      expect(manager.canStart()).toBe(false);
    });

    it("should correctly report isRunning", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      expect(manager.isRunning()).toBe(false);

      manager.start();
      expect(manager.isRunning()).toBe(true);

      manager.complete({
        pages: [],
        totalPages: 0,
        cancelled: false,
        completedAt: new Date().toISOString(),
      });
      expect(manager.isRunning()).toBe(false);
    });

    it("should correctly report isComplete", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      expect(manager.isComplete()).toBe(false);

      manager.start();
      expect(manager.isComplete()).toBe(false);

      manager.complete({
        pages: [],
        totalPages: 0,
        cancelled: false,
        completedAt: new Date().toISOString(),
      });
      expect(manager.isComplete()).toBe(true);
    });

    it("should set pagination result", () => {
      const manager = createExportJobManager(TEST_CONVERSATION_ID);
      const paginationResult = {
        pages: [["00000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000003"]],
        totalPages: 1,
      };

      manager.setPaginationResult(paginationResult);

      expect(manager.getJob().paginationResult).toEqual(paginationResult);
    });
  });
});
