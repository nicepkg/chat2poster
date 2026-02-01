"use client";

import type { ExportParams } from "@chat2poster/core-schema";
import { motion } from "framer-motion";
import * as React from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { useI18n } from "~/i18n";
import { cn } from "~/utils/common";

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
  const { t } = useI18n();

  return (
    <div className={cn("c2p-export-tab space-y-6 p-4", className)}>
      {/* Export Scale - controls image resolution multiplier */}
      <div className="c2p-scale-section space-y-3">
        <Label className="c2p-section-label text-muted-foreground text-xs uppercase tracking-wide">
          {t("export.scale")}
        </Label>
        <div className="c2p-scale-options grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((scale) => (
            <Button
              key={scale}
              variant={exportParams.scale === scale ? "default" : "outline"}
              onClick={() => onParamsChange({ scale })}
              className={cn(
                "c2p-scale-btn h-10",
                exportParams.scale === scale && "c2p-scale-selected",
              )}
            >
              {scale}x
            </Button>
          ))}
        </div>
        <p className="c2p-scale-hint text-muted-foreground text-xs">
          {t("export.scaleHint")}
        </p>
      </div>

      {/* Auto Pagination Toggle - splits long conversations into multiple pages */}
      <div className="c2p-pagination-section flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="c2p-toggle-label text-sm">
            {t("export.autoPagination")}
          </Label>
          <p className="c2p-toggle-hint text-muted-foreground text-xs">
            {t("export.autoPaginationHint")}
          </p>
        </div>
        <Switch
          checked={autoPagination}
          onCheckedChange={onAutoPaginationChange}
          className="c2p-pagination-toggle"
        />
      </div>

      {/* Max Page Height - controls when to split into new page */}
      {autoPagination && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="c2p-page-height-section space-y-3"
        >
          <div className="flex items-center justify-between">
            <Label className="c2p-section-label text-muted-foreground text-xs uppercase tracking-wide">
              {t("export.maxPageHeight")}
            </Label>
            <span className="c2p-value-display text-muted-foreground text-xs">
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
            className="c2p-page-height-slider"
          />
        </motion.div>
      )}

      {/* Export Info - shows what will be exported */}
      <div className="c2p-export-info bg-muted/50 rounded-lg p-3">
        <p className="text-muted-foreground text-xs">
          {pageCount > 1
            ? t("export.infoMulti", { count: pageCount })
            : t("export.infoSingle")}
        </p>
      </div>
    </div>
  );
}
