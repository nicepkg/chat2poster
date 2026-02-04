"use client";

import type { Conversation } from "@chat2poster/core-schema";
import { createContext, useContext, type ReactNode } from "react";

export interface EditorDataContextValue {
  parseConversation?: () => Promise<Conversation>;
  exportConversation?: () => Promise<void>;
}

const EditorDataContext = createContext<EditorDataContextValue | null>(null);

export function EditorDataProvider({
  children,
  parseConversation,
  exportConversation,
}: {
  children: ReactNode;
  parseConversation?: () => Promise<Conversation>;
  exportConversation?: () => Promise<void>;
}) {
  return (
    <EditorDataContext.Provider
      value={{ parseConversation, exportConversation }}
    >
      {children}
    </EditorDataContext.Provider>
  );
}

export function useEditorData() {
  return useContext(EditorDataContext);
}
