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
 * Message content structure
 */
export interface MessageContent {
  content_type?: string;
  parts?: (string | Record<string, JsonValue>)[];
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
