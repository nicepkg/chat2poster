"use client";

import * as React from "react";
import type { ExportParams } from "@chat2poster/core-schema";
import { cn } from "../../lib/utils";

export interface ExportTabProps {
  exportParams: ExportParams;
  autoPagination: boolean;
  onParamsChange: (params: Partial<ExportParams>) => void;
  onAutoPaginationChange: (enabled: boolean) => void;
  className?: string;
}

export function ExportTab({
  exportParams,
  autoPagination,
  onParamsChange,
  onAutoPaginationChange,
  className,
}: ExportTabProps) {
  return (
    <div className={cn("space-y-5 p-4", className)}>
      {/* Scale */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Scale
        </label>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((scale) => (
            <button
              key={scale}
              onClick={() => onParamsChange({ scale })}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                exportParams.scale === scale
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {scale}x
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Higher scale = better quality, larger file
        </p>
      </div>

      {/* Canvas Width */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Canvas Width
        </label>
        <select
          value={exportParams.canvasWidthPx}
          onChange={(e) =>
            onParamsChange({ canvasWidthPx: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="600">Narrow (600px)</option>
          <option value="800">Standard (800px)</option>
          <option value="1080">Wide (1080px)</option>
        </select>
      </div>

      {/* Auto Pagination Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">
            Auto Pagination
          </label>
          <p className="text-xs text-muted-foreground">
            Split long conversations into pages
          </p>
        </div>
        <button
          onClick={() => onAutoPaginationChange(!autoPagination)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            autoPagination ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
              autoPagination ? "left-5" : "left-0.5"
            )}
          />
        </button>
      </div>

      {/* Max Page Height (shown when auto pagination is on) */}
      {autoPagination && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Max Page Height
          </label>
          <input
            type="number"
            min="2000"
            max="10000"
            step="100"
            value={exportParams.maxPageHeightPx}
            onChange={(e) =>
              onParamsChange({ maxPageHeightPx: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="text-xs text-muted-foreground">
            {exportParams.maxPageHeightPx}px per page
          </span>
        </div>
      )}

      {/* Output Mode */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Output Mode
        </label>
        <select
          value={exportParams.outputMode}
          onChange={(e) =>
            onParamsChange({
              outputMode: e.target.value as ExportParams["outputMode"],
            })
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="single">Single PNG</option>
          <option value="multi-zip">Multi-page ZIP</option>
        </select>
      </div>
    </div>
  );
}
