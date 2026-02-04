export interface ClaudeConversationResponse {
  uuid?: string;
  name?: string;
  snapshot_name?: string;
  created_by?: string;
  creator?: {
    uuid?: string;
    full_name?: string;
  };
  summary?: string;
  created_at?: string;
  updated_at?: string;
  project_uuid?: string | null;
  current_leaf_message_uuid?: string;
  up_to_date?: boolean;
  is_public?: boolean;
  chat_messages?: ClaudeMessage[];
}

export interface ClaudeMessage {
  uuid: string;
  sender: "human" | "assistant";
  text?: string;
  content?: ClaudeMessageContent[];
  index?: number;
  created_at?: string;
  updated_at?: string;
  truncated?: boolean;
  attachments?: unknown[];
  files?: unknown[];
  files_v2?: unknown[];
  sync_ressources?: unknown[];
  parent_message_uuid?: string;
  stop_reason?: string;
}

export interface ClaudeMessageContent {
  type?: string;
  text?: string;
  citations?: unknown[];
}
