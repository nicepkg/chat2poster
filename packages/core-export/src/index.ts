/**
 * @chat2poster/core-export
 *
 * Export engine for chat2poster.
 * Handles image generation with SnapDOM, multi-page exports, and ZIP packaging.
 */

// Resource loading
export {
  waitForFonts,
  waitForImages,
  waitForResources,
  getImageUrls,
  preloadImages,
} from "./resource-loader";

// Single page export
export {
  exportToPng,
  exportToJpeg,
  exportElement,
  isCanvasSizeValid,
  validateExportParams,
  type ExportOptions,
  type ExportResult,
  DEFAULT_EXPORT_OPTIONS,
} from "./exporter";

// Multi-page export
export {
  exportPages,
  exportElements,
  getBlobs,
  getTotalSize,
  formatFileSize,
  type ProgressCallback,
  type MultiPageExportOptions,
  type MultiPageExportResult,
  type PageRenderer,
} from "./multi-page-exporter";

// ZIP packaging
export {
  packageAsZip,
  generatePageFilename,
  generateZipFilename,
  triggerDownload,
  downloadZip,
  downloadImage,
  type ZipOptions,
  type ZipResult,
  DEFAULT_ZIP_OPTIONS,
} from "./zip-packager";

// Export job manager
export {
  ExportJobManager,
  createExportJobManager,
  type ExportJobEventType,
  type ExportJobEventData,
  type ExportJobEventListener,
} from "./export-job-manager";
