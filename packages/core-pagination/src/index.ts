/**
 * @chat2poster/core-pagination
 *
 * Height estimation and pagination logic for chat2poster.
 * Provides deterministic page splitting for conversation exports.
 */

// Height estimation
export {
  estimateMessageHeight,
  estimateMessagesHeight,
  estimateMessagesHeightWithBreakdown,
  analyzeContentMeta,
  type HeightEstimationConfig,
  DEFAULT_HEIGHT_CONFIG,
} from "./height-estimation";

// Paginator
export {
  paginate,
  needsPagination,
  getEstimatedTotalHeight,
  suggestPageBreaks,
  getPageHeights,
  type PaginationConfig,
  DEFAULT_PAGINATION_CONFIG,
} from "./paginator";
