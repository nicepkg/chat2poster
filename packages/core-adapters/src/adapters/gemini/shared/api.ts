import { createAppError } from "@chat2poster/core-schema";
import { fetchExternal } from "../../../network";
import { extractPayloadFromBatchExecuteResponse } from "./parser";
import type { GeminiBatchExecuteRequest } from "./types";

const BATCH_EXECUTE_ENDPOINT =
  "https://gemini.google.com/_/BardChatUi/data/batchexecute";

export async function fetchBatchExecutePayload(
  request: GeminiBatchExecuteRequest,
): Promise<string> {
  const query = new URLSearchParams({
    rpcids: request.rpcId,
    "source-path": request.sourcePath,
    bl: request.runtimeParams.bl,
    "f.sid": request.runtimeParams.fSid,
    hl: request.runtimeParams.hl,
    _reqid: `${1_000_000 + Math.floor(Math.random() * 9_000_000)}`,
    rt: "c",
  });

  const fReq = JSON.stringify([
    [[request.rpcId, request.rpcPayload ?? "[]", null, "generic"]],
  ]);
  const body = new URLSearchParams({ "f.req": fReq });
  if (request.runtimeParams.at) {
    body.set("at", request.runtimeParams.at);
  }

  const headers: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    Origin: "https://gemini.google.com",
    "X-Same-Domain": "1",
  };
  if (request.cookie) {
    headers.Cookie = request.cookie;
  }

  const result = await fetchExternal(
    `${BATCH_EXECUTE_ENDPOINT}?${query.toString()}`,
    {
      method: "POST",
      mode: "cors",
      credentials: "include",
      referrer: request.referrerUrl,
      referrerPolicy: "strict-origin-when-cross-origin",
      headers,
      body: body.toString(),
    },
  );

  if (!result.ok) {
    throw createAppError(
      "E-PARSE-005",
      `Gemini API responded with ${result.status}`,
    );
  }

  const responseText = await result.text();
  const payload = extractPayloadFromBatchExecuteResponse(
    responseText,
    request.rpcId,
  );

  if (!payload) {
    throw createAppError(
      "E-PARSE-005",
      "Cannot locate Gemini payload in batchexecute response",
    );
  }

  return payload;
}
