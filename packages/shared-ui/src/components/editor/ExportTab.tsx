"use client";

import * as React from "react";
import type { ExportParams } from "@chat2poster/core-schema";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface ExportTabProps {
  exportParams: ExportParams;
  autoPagination: boolean;
  pageCount?: number;
  onParamsChange: (params: Partial<ExportParams>) => void;
  onAutoPaginationChange: (enabled: boolean) => void;
  className?: string;
}

export function ExportTab({
  exportParams,
  autoPagination,
  pageCount = 1,
  onParamsChange,
  onAutoPaginationChange,
  className,
}: ExportTabProps) {
  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Scale */}
      <div className="space-y-3">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
          Scale
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((scale) => (
            <Button
              key={scale}
              variant={exportParams.scale === scale ? "default" : "outline"}
              onClick={() => onParamsChange({ scale })}
              className="h-10"
            >
              {scale}x
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Higher scale = better quality, larger file
        </p>
      </div>

      {/* Canvas Width */}
      <div className="space-y-3">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
          Canvas Width
        </Label>
        <Select
          value={String(exportParams.canvasWidthPx)}
          onValueChange={(value) =>
            onParamsChange({ canvasWidthPx: Number(value) })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="600">600px</SelectItem>
            <SelectItem value="800">800px (Recommended)</SelectItem>
            <SelectItem value="1080">1080px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Auto Pagination Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">Auto Pagination</Label>
          <p className="text-muted-foreground text-xs">
            Split long conversations into pages
          </p>
        </div>
        <Switch
          checked={autoPagination}
          onCheckedChange={onAutoPaginationChange}
        />
      </div>

      {/* Max Page Height */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">
            Max Page Height
          </Label>
          <span className="text-muted-foreground text-xs">
            {exportParams.maxPageHeightPx}px
          </span>
        </div>
        <Slider
          value={[exportParams.maxPageHeightPx]}
          min={2000}
          max={8000}
          step={500}
          onValueChange={(values) =>
            onParamsChange({
              maxPageHeightPx: values[0] ?? exportParams.maxPageHeightPx,
            })
          }
        />
      </div>

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-muted-foreground text-xs">
          {pageCount > 1
            ? `Your export will be split into ${pageCount} pages and downloaded as a ZIP file.`
            : "Your export will be a single PNG image."}
        </p>
      </div>
    </div>
  );
}
