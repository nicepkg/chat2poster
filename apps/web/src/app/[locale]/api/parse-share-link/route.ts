import {
  registerBuiltinAdapters,
  parseWithAdapters,
} from "@chat2poster/core-adapters";
import type { Conversation } from "@chat2poster/core-schema";
import {
  createTranslator,
  type MessageKey,
} from "@chat2poster/shared-ui/i18n/core";
import { type NextRequest, NextResponse } from "next/server";

// Register adapters at module load time
registerBuiltinAdapters();

interface ParseRequest {
  url: string;
}

interface ParseResponse {
  success: boolean;
  conversation?: Conversation;
  error?: {
    code: string;
    message: string;
  };
}

// Rate limiting - simple in-memory store (for demo purposes)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function validateShareUrl(url: string): {
  valid: boolean;
  provider?: string;
  errorKey?: MessageKey;
} {
  try {
    const parsed = new URL(url);

    // ChatGPT share links
    if (
      parsed.hostname === "chat.openai.com" ||
      parsed.hostname === "chatgpt.com"
    ) {
      // Support both /share/ and /s/ formats
      if (
        parsed.pathname.startsWith("/share/") ||
        parsed.pathname.startsWith("/s/")
      ) {
        return { valid: true, provider: "chatgpt" };
      }
      return { valid: false, errorKey: "api.parseShareLink.invalidChatgpt" };
    }

    // Claude share links
    if (parsed.hostname === "claude.ai") {
      if (parsed.pathname.startsWith("/share/")) {
        return { valid: true, provider: "claude" };
      }
      return { valid: false, errorKey: "api.parseShareLink.invalidClaude" };
    }

    // Gemini share links
    if (parsed.hostname === "gemini.google.com") {
      if (parsed.pathname.startsWith("/share/")) {
        return { valid: true, provider: "gemini" };
      }
      return { valid: false, errorKey: "api.parseShareLink.invalidGemini" };
    }

    return { valid: false, errorKey: "api.parseShareLink.unsupportedDomain" };
  } catch {
    return { valid: false, errorKey: "api.parseShareLink.invalidUrl" };
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { locale: string } },
): Promise<NextResponse<ParseResponse>> {
  const { t } = createTranslator(context.params.locale);
  const startTime = Date.now();
  const ip = getClientIp(request);

  // Rate limiting
  if (!checkRateLimit(ip)) {
    console.log(`[parse-share-link] Rate limit exceeded for ${ip}`);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "E-PARSE-RATE-LIMIT",
          message: t("api.parseShareLink.rateLimit"),
        },
      },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as ParseRequest;
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "E-PARSE-INVALID-INPUT",
            message: t("api.parseShareLink.invalidInput"),
          },
        },
        { status: 400 },
      );
    }

    // Validate URL
    const validation = validateShareUrl(url);
    if (!validation.valid) {
      console.log(
        `[parse-share-link] Invalid URL: ${url}, errorKey: ${validation.errorKey}`,
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "E-PARSE-UNSUPPORTED",
            message: t(
              validation.errorKey ?? "api.parseShareLink.unsupportedUrl",
            ),
          },
        },
        { status: 400 },
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
        `[parse-share-link] Provider: ${validation.provider}, Adapter: ${result.adapterId}, Duration: ${duration}ms, Status: success`,
      );

      return NextResponse.json({
        success: true,
        conversation: result.conversation,
      });
    } catch (parseError: unknown) {
      const duration = Date.now() - startTime;

      // Handle different error types
      let errorMessage: string;
      let errorCode: string;

      if (parseError instanceof Error) {
        // Standard Error instance
        errorMessage = t("api.parseShareLink.parseFailed");
        errorCode = "E-PARSE-FAILED";
      } else if (
        parseError &&
        typeof parseError === "object" &&
        "code" in parseError &&
        "message" in parseError
      ) {
        // AppError object from core-schema
        const appError = parseError as {
          code: string;
          message: string;
          detail?: string;
        };
        errorCode = appError.code;
        errorMessage = t("api.parseShareLink.parseFailed");
      } else {
        errorMessage = t("api.parseShareLink.parseFailed");
        errorCode = "E-PARSE-FAILED";
      }

      console.error(
        `[parse-share-link] Parse error after ${duration}ms:`,
        errorCode,
        errorMessage,
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
          },
        },
        { status: 422 },
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[parse-share-link] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "E-PARSE-NETWORK",
          message: t("api.parseShareLink.networkError"),
        },
      },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET(
  _request: NextRequest,
  context: { params: { locale: string } },
): Promise<NextResponse> {
  const { t } = createTranslator(context.params.locale);
  return NextResponse.json({
    status: "ok",
    supportedProviders: ["chatgpt", "claude", "gemini"],
    message: t("api.parseShareLink.ready"),
  });
}
