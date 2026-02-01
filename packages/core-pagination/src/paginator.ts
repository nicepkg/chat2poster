import type {
  Message,
  Selection,
  PaginationResult,
  PageBreak,
} from "@chat2poster/core-schema";
import {
  estimateMessageHeight,
  type HeightEstimationConfig,
  DEFAULT_HEIGHT_CONFIG,
} from "./height-estimation";

/**
 * Configuration for pagination
 */
export interface PaginationConfig {
  /** Maximum height for a single page in pixels */
  maxPageHeightPx: number;
  /** Minimum height for a page (to avoid tiny pages) */
  minPageHeightPx: number;
  /** Height configuration for message estimation */
  heightConfig: HeightEstimationConfig;
  /** Whether to use auto pagination when no manual breaks exist */
  autoEnabled: boolean;
}

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  maxPageHeightPx: 4096,
  minPageHeightPx: 200,
  heightConfig: DEFAULT_HEIGHT_CONFIG,
  autoEnabled: true,
};

/**
 * Internal page representation during pagination
 */
interface PageBuilder {
  messageIds: string[];
  currentHeight: number;
}

/**
 * Get messages in selection order
 */
function getSelectedMessages(
  allMessages: Message[],
  selectedIds: string[],
): Message[] {
  const messageMap = new Map(allMessages.map((m) => [m.id, m]));
  const result: Message[] = [];

  for (const id of selectedIds) {
    const msg = messageMap.get(id);
    if (msg) {
      result.push(msg);
    }
  }

  return result;
}

/**
 * Apply manual page breaks to create pages
 * Manual breaks always take priority
 */
function applyManualBreaks(
  messages: Message[],
  pageBreaks: PageBreak[],
  _config: PaginationConfig,
): string[][] {
  if (messages.length === 0) {
    return [];
  }

  if (pageBreaks.length === 0) {
    return [messages.map((m) => m.id)];
  }

  // Create a set of message IDs where breaks occur (after this message)
  const breakAfterIds = new Set(pageBreaks.map((pb) => pb.afterMessageId));

  const pages: string[][] = [];
  let currentPage: string[] = [];

  for (const msg of messages) {
    currentPage.push(msg.id);

    // Check if there's a break after this message
    if (breakAfterIds.has(msg.id)) {
      pages.push(currentPage);
      currentPage = [];
    }
  }

  // Don't forget the last page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

/**
 * Auto-paginate a list of messages using greedy bin-packing
 * Deterministic: same input always produces same output
 */
function autoPaginate(
  messages: Message[],
  config: PaginationConfig,
): string[][] {
  if (messages.length === 0) {
    return [];
  }

  const pages: string[][] = [];
  let currentPage: PageBuilder = {
    messageIds: [],
    currentHeight: 0,
  };

  for (const msg of messages) {
    const msgHeight = estimateMessageHeight(msg, config.heightConfig);

    // Check if adding this message would exceed max height
    if (
      currentPage.messageIds.length > 0 &&
      currentPage.currentHeight + msgHeight > config.maxPageHeightPx
    ) {
      // Start a new page
      pages.push(currentPage.messageIds);
      currentPage = {
        messageIds: [],
        currentHeight: 0,
      };
    }

    // Add message to current page
    currentPage.messageIds.push(msg.id);
    currentPage.currentHeight += msgHeight;

    // Handle case where single message exceeds max height
    // We still put it on its own page (can't split a message)
    if (
      msgHeight > config.maxPageHeightPx &&
      currentPage.messageIds.length === 1
    ) {
      pages.push(currentPage.messageIds);
      currentPage = {
        messageIds: [],
        currentHeight: 0,
      };
    }
  }

  // Don't forget the last page
  if (currentPage.messageIds.length > 0) {
    pages.push(currentPage.messageIds);
  }

  return pages;
}

/**
 * Check if content needs pagination based on total height
 */
export function needsPagination(
  messages: Message[],
  config: Partial<PaginationConfig> = {},
): boolean {
  const fullConfig: PaginationConfig = {
    ...DEFAULT_PAGINATION_CONFIG,
    ...config,
    heightConfig: {
      ...DEFAULT_HEIGHT_CONFIG,
      ...config.heightConfig,
    },
  };

  let totalHeight = 0;
  for (const msg of messages) {
    totalHeight += estimateMessageHeight(msg, fullConfig.heightConfig);
    if (totalHeight > fullConfig.maxPageHeightPx) {
      return true;
    }
  }
  return false;
}

/**
 * Get estimated total height
 */
export function getEstimatedTotalHeight(
  messages: Message[],
  config: Partial<PaginationConfig> = {},
): number {
  const fullConfig: PaginationConfig = {
    ...DEFAULT_PAGINATION_CONFIG,
    ...config,
    heightConfig: {
      ...DEFAULT_HEIGHT_CONFIG,
      ...config.heightConfig,
    },
  };

  return messages.reduce(
    (total, msg) => total + estimateMessageHeight(msg, fullConfig.heightConfig),
    0,
  );
}

/**
 * Paginate messages based on selection and configuration
 *
 * Behavior:
 * 1. If manual pageBreaks exist, use them (may exceed maxPageHeight)
 * 2. If no manual breaks and autoEnabled, apply auto-pagination
 * 3. If no manual breaks and !autoEnabled, return single page
 */
export function paginate(
  allMessages: Message[],
  selection: Selection,
  config: Partial<PaginationConfig> = {},
): PaginationResult {
  const fullConfig: PaginationConfig = {
    ...DEFAULT_PAGINATION_CONFIG,
    ...config,
    heightConfig: {
      ...DEFAULT_HEIGHT_CONFIG,
      ...config.heightConfig,
    },
  };

  // Get selected messages in order
  const selectedMessages = getSelectedMessages(
    allMessages,
    selection.selectedMessageIds,
  );

  if (selectedMessages.length === 0) {
    return {
      pages: [],
      totalPages: 0,
    };
  }

  let pages: string[][];

  // Check if there are manual page breaks
  const hasManualBreaks = selection.pageBreaks.length > 0;

  if (hasManualBreaks) {
    // Use manual breaks (respects user intent even if pages are too tall)
    pages = applyManualBreaks(
      selectedMessages,
      selection.pageBreaks,
      fullConfig,
    );
  } else if (fullConfig.autoEnabled) {
    // Apply auto pagination
    pages = autoPaginate(selectedMessages, fullConfig);
  } else {
    // Single page mode
    pages = [selectedMessages.map((m) => m.id)];
  }

  return {
    pages,
    totalPages: pages.length,
  };
}

/**
 * Suggest optimal page breaks for given messages
 * Returns suggested PageBreaks that would result in balanced pages
 */
export function suggestPageBreaks(
  messages: Message[],
  config: Partial<PaginationConfig> = {},
): PageBreak[] {
  const fullConfig: PaginationConfig = {
    ...DEFAULT_PAGINATION_CONFIG,
    ...config,
    heightConfig: {
      ...DEFAULT_HEIGHT_CONFIG,
      ...config.heightConfig,
    },
  };

  if (messages.length === 0) {
    return [];
  }

  // Use auto-pagination to find natural break points
  const pages = autoPaginate(messages, fullConfig);

  // Convert page boundaries to PageBreaks
  const pageBreaks: PageBreak[] = [];

  for (let i = 0; i < pages.length - 1; i++) {
    const page = pages[i];
    if (page && page.length > 0) {
      const lastMessageId = page[page.length - 1];
      if (lastMessageId) {
        pageBreaks.push({
          id: crypto.randomUUID(),
          afterMessageId: lastMessageId,
          label: `Page ${i + 2}`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return pageBreaks;
}

/**
 * Get page heights breakdown
 */
export function getPageHeights(
  allMessages: Message[],
  paginationResult: PaginationResult,
  config: Partial<PaginationConfig> = {},
): number[] {
  const fullConfig: PaginationConfig = {
    ...DEFAULT_PAGINATION_CONFIG,
    ...config,
    heightConfig: {
      ...DEFAULT_HEIGHT_CONFIG,
      ...config.heightConfig,
    },
  };

  const messageMap = new Map(allMessages.map((m) => [m.id, m]));
  const heights: number[] = [];

  for (const page of paginationResult.pages) {
    let pageHeight = 0;
    for (const id of page) {
      const msg = messageMap.get(id);
      if (msg) {
        pageHeight += estimateMessageHeight(msg, fullConfig.heightConfig);
      }
    }
    heights.push(pageHeight);
  }

  return heights;
}
