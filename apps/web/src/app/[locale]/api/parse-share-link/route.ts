import {
  registerBuiltinAdapters,
  parseWithAdapters,
  canHandleShareLink,
} from "@chat2poster/core-adapters";
import type { Conversation } from "@chat2poster/core-schema";
import { createTranslator } from "@chat2poster/shared-ui/i18n/core";
import { mergeAdjacentSameRoleMessages } from "@chat2poster/shared-ui/utils";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Register adapters at module load time
registerBuiltinAdapters();

/**
 * Request body schema for parse-share-link API
 */
const ParseRequestSchema = z.object({
  url: z.string().min(1).max(2048),
});

interface ParseResponse {
  success: boolean;
  conversation?: Conversation;
  error?: {
    code: string;
    message: string;
  };
}

type RouteContext = {
  params: Promise<{ locale: string }>;
};

async function resolveLocale(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.locale;
}

/**
 * Create a standardized error response
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number,
): NextResponse<ParseResponse> {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

/**
 * Extract error details from various error types
 */
function extractErrorDetails(
  error: unknown,
  fallbackMessage: string,
): { code: string; message: string } {
  // AppError from core-schema
  if (error && typeof error === "object" && "code" in error) {
    const appError = error as { code: string };
    return { code: appError.code, message: fallbackMessage };
  }
  // Standard Error or unknown
  return { code: "E-PARSE-FAILED", message: fallbackMessage };
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ParseResponse>> {
  const { t } = createTranslator(await resolveLocale(context));
  const startTime = Date.now();

  try {
    const body: unknown = await request.json();
    const parseResult = ParseRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return createErrorResponse(
        "E-PARSE-INVALID-INPUT",
        t("api.parseShareLink.invalidInput"),
        400,
      );
    }

    const { url } = parseResult.data;

    // Validate URL using adapter registry
    if (!canHandleShareLink(url)) {
      console.log(`[parse-share-link] Unsupported URL: ${url}`);
      return createErrorResponse(
        "E-PARSE-UNSUPPORTED",
        t("api.parseShareLink.unsupportedUrl"),
        400,
      );
    }

    // Use core-adapters to parse the share link
    try {
      const result = await parseWithAdapters({
        type: "share-link",
        url,
      });

      const duration = Date.now() - startTime;
      console.log(
        `[parse-share-link] Adapter: ${result.adapterId}, Duration: ${duration}ms, Status: success`,
      );

      // Merge adjacent messages with the same role
      const mergedConversation = mergeAdjacentSameRoleMessages(
        result.conversation,
      );

      return NextResponse.json({
        success: true,
        conversation: mergedConversation,
      });
    } catch (parseError: unknown) {
      console.error(parseError);
      const duration = Date.now() - startTime;
      const { code, message } = extractErrorDetails(
        parseError,
        t("api.parseShareLink.parseFailed"),
      );

      console.error(
        `[parse-share-link] Parse error after ${duration}ms:`,
        code,
        message,
      );

      return createErrorResponse(code, message, 422);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[parse-share-link] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error",
    );

    return createErrorResponse(
      "E-PARSE-NETWORK",
      t("api.parseShareLink.networkError"),
      500,
    );
  }
}

// Health check endpoint
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { t } = createTranslator(await resolveLocale(context));
  return NextResponse.json({
    status: "ok",
    supportedProviders: ["chatgpt", "claude", "gemini"],
    message: t("api.parseShareLink.ready"),
  });
}
