/**
 * ChatGPT Share Link Types
 *
 * Type definitions for parsing ChatGPT share link data.
 */

/**
 * JSON value type for recursive structures
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Message author metadata
 */
export interface MessageAuthor {
  role?: string;
  name?: string;
}

/**
 * Image asset pointer in multimodal content
 */
export interface ImageAssetPointer {
  content_type: "image_asset_pointer";
  asset_pointer: string;
  size_bytes?: number;
  width?: number | string;
  height?: number | string | string[];
  metadata?: {
    dalle?: {
      gen_id?: string;
      prompt?: string;
    };
    generation?: {
      gen_id?: string;
      width?: number | string;
      height?: number | string | string[];
    };
  };
}

/**
 * Message content structure
 */
export interface MessageContent {
  /**
   * "thoughts"
   */
  content_type?: string;
  parts?: (string | Record<string, JsonValue> | ImageAssetPointer)[];
  text?: string;
  language?: string;
  thoughts?: Array<{ summary?: string; content?: string }>;
}

/**
 * Message node in the conversation mapping
 */
export interface MessageNode {
  id?: string;
  message?: {
    id?: string;
    author?: MessageAuthor;
    content?: MessageContent;
    create_time?: number;
    metadata?: {
      is_visually_hidden_from_conversation?: boolean;
      user_context_message_data?: number;
      is_user_system_message?: boolean;
      shared_conversation_id?: string;
      is_redacted?: boolean;
      developer_mode_connector_ids?: string[];
      selected_sources?: string[];
      selected_github_repos?: string[];
      serialization_metadata?: { custom_symbol_offsets: number[] };
      request_id?: string;
      message_source?: string;
      turn_exchange_id?: string;
      reasoning_status?: string;
      citations?: unknown[];
      content_references?: unknown[];
      classifier_response?: string;
      skip_reasoning_title?: string;
      message_type?: string;
      model_slug?: string;
      default_model_slug?: string;
      thinking_effort?: number;
      parent_id?: string;
      finish_details?: {
        type?: string;
        stop_tokens?: string[];
      };
      is_complete?: boolean;
      attachments?: Array<{
        download_url?: string;
        file_url?: string;
        mime_type?: string;
        name?: string;
        title?: string;
        file_type?: string;
        type?: string;
      }>;
    };
  };
  parent?: string;
  children?: string[];
}

/**
 * Share data from ChatGPT API response
 */
export interface ShareData {
  title?: string;
  model?: { slug?: string };
  update_time?: number;
  mapping?: Record<string, MessageNode>;
  linear_conversation?: Array<{ id?: string }>;
}

/**
 * Server response wrapper
 */
export interface ServerResponse {
  data?: ShareData;
  sharedConversationId?: string;
}

/**
 * Loader data structure for React Flight payload
 */
export interface LoaderData {
  "routes/share.$shareId.($action)"?: {
    serverResponse?: ServerResponse;
    sharedConversationId?: string;
  };
}

/**
 * Decoded loader result
 */
export interface DecodedLoader {
  loaderData?: LoaderData;
}
