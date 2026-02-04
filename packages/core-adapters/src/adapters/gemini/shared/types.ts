export interface GeminiRuntimeParams {
  at?: string;
  bl: string;
  fSid: string;
  hl: string;
}

export interface GeminiBatchExecuteRequest {
  rpcId: string;
  sourcePath: string;
  referrerUrl: string;
  runtimeParams: GeminiRuntimeParams;
  cookie?: string;
}
