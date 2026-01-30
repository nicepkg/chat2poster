import { z } from "zod";

/**
 * A page break marker inserted after a specific message
 */
export const PageBreak = z
  .object({
    id: z.string().uuid(),
    afterMessageId: z.string().uuid(),
    label: z.string().optional(),
    createdAt: z.string().datetime().optional(),
  })
  .strict();
export type PageBreak = z.infer<typeof PageBreak>;

/**
 * Selection state - which messages are selected and where page breaks are
 */
export const Selection = z
  .object({
    conversationId: z.string().uuid(),
    selectedMessageIds: z
      .array(z.string().uuid())
      .min(1, "At least one message must be selected"),
    pageBreaks: z.array(PageBreak).default([]),
    updatedAt: z.string().datetime().optional(),
  })
  .strict()
  .refine(
    (sel) => {
      // PB-001: pageBreak.afterMessageId must be in selectedMessageIds
      return sel.pageBreaks.every((pb) =>
        sel.selectedMessageIds.includes(pb.afterMessageId)
      );
    },
    { message: "Page break afterMessageId must be in selectedMessageIds" }
  )
  .refine(
    (sel) => {
      // PB-002: No duplicate page breaks on same message
      const afterIds = sel.pageBreaks.map((pb) => pb.afterMessageId);
      return afterIds.length === new Set(afterIds).size;
    },
    { message: "Duplicate page breaks on same message not allowed" }
  );
export type Selection = z.infer<typeof Selection>;

/**
 * Create a new selection with defaults
 */
export function createSelection(
  partial: Pick<Selection, "conversationId" | "selectedMessageIds"> &
    Partial<Selection>
): Selection {
  return Selection.parse({
    pageBreaks: [],
    updatedAt: new Date().toISOString(),
    ...partial,
  });
}

/**
 * Create a selection that includes all messages
 */
export function createFullSelection(
  conversationId: string,
  messageIds: string[]
): Selection {
  return createSelection({
    conversationId,
    selectedMessageIds: messageIds,
  });
}
