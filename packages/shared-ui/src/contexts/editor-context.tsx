"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Conversation,
  Selection,
  Decoration,
  ExportParams,
  PageBreak,
  Theme,
} from "@chat2poster/core-schema";

// Default theme presets
export const THEME_PRESETS: Theme[] = [
  {
    id: "light",
    name: "Light",
    mode: "light",
    tokens: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      baseFontSize: 16,
      lineHeight: 1.6,
      bubbleRadius: 12,
      messagePadding: 16,
      messageGap: 16,
      colors: {
        background: "#ffffff",
        foreground: "#1a1a1a",
        muted: "#f5f5f5",
        mutedForeground: "#737373",
        userBubble: "#e0f2fe",
        userBubbleForeground: "#0c4a6e",
        assistantBubble: "#f0fdf4",
        assistantBubbleForeground: "#14532d",
        systemBubble: "#f5f5f5",
        systemBubbleForeground: "#525252",
        codeBlockBackground: "#1e1e1e",
        codeBlockForeground: "#d4d4d4",
        border: "#e5e5e5",
      },
      codeTheme: "github-dark",
    },
    decorationDefaults: {
      canvasPaddingPx: 24,
      canvasRadiusPx: 12,
      shadowLevel: "md",
      backgroundType: "solid",
      backgroundValue: "#ffffff",
      macosBarEnabled: true,
    },
  },
  {
    id: "dark",
    name: "Dark",
    mode: "dark",
    tokens: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      baseFontSize: 16,
      lineHeight: 1.6,
      bubbleRadius: 12,
      messagePadding: 16,
      messageGap: 16,
      colors: {
        background: "#18181b",
        foreground: "#fafafa",
        muted: "#27272a",
        mutedForeground: "#a1a1aa",
        userBubble: "#1e3a5f",
        userBubbleForeground: "#bae6fd",
        assistantBubble: "#14532d",
        assistantBubbleForeground: "#bbf7d0",
        systemBubble: "#27272a",
        systemBubbleForeground: "#a1a1aa",
        codeBlockBackground: "#0d0d0d",
        codeBlockForeground: "#d4d4d4",
        border: "#3f3f46",
      },
      codeTheme: "github-dark",
    },
    decorationDefaults: {
      canvasPaddingPx: 24,
      canvasRadiusPx: 12,
      shadowLevel: "lg",
      backgroundType: "solid",
      backgroundValue: "#09090b",
      macosBarEnabled: true,
    },
  },
  {
    id: "gradient-sunset",
    name: "Sunset",
    mode: "light",
    tokens: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      baseFontSize: 16,
      lineHeight: 1.6,
      bubbleRadius: 16,
      messagePadding: 16,
      messageGap: 16,
      colors: {
        background: "#ffffff",
        foreground: "#1a1a1a",
        muted: "#fef3c7",
        mutedForeground: "#92400e",
        userBubble: "#fef3c7",
        userBubbleForeground: "#78350f",
        assistantBubble: "#fce7f3",
        assistantBubbleForeground: "#831843",
        systemBubble: "#f5f5f5",
        systemBubbleForeground: "#525252",
        codeBlockBackground: "#1e1e1e",
        codeBlockForeground: "#d4d4d4",
        border: "#fde68a",
      },
      codeTheme: "github-dark",
    },
    decorationDefaults: {
      canvasPaddingPx: 32,
      canvasRadiusPx: 20,
      shadowLevel: "xl",
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)",
      macosBarEnabled: true,
    },
  },
];

// Background presets
export const BACKGROUND_PRESETS = [
  { id: "white", label: "White", value: "#ffffff", type: "solid" as const },
  { id: "gray", label: "Gray", value: "#f5f5f5", type: "solid" as const },
  { id: "dark", label: "Dark", value: "#18181b", type: "solid" as const },
  {
    id: "gradient-blue",
    label: "Blue Gradient",
    value: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    type: "gradient" as const,
  },
  {
    id: "gradient-purple",
    label: "Purple Gradient",
    value: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
    type: "gradient" as const,
  },
  {
    id: "gradient-sunset",
    label: "Sunset Gradient",
    value: "linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)",
    type: "gradient" as const,
  },
];

// State types
export interface EditorState {
  conversation: Conversation | null;
  selection: Selection | null;
  selectedTheme: Theme;
  decoration: Decoration;
  exportParams: ExportParams;
  autoPagination: boolean;
}

export interface RuntimeState {
  isLoading: boolean;
  isParsing: boolean;
  isExporting: boolean;
  error: string | null;
  exportProgress: number;
}

export type EditorAction =
  | { type: "SET_CONVERSATION"; payload: Conversation }
  | { type: "SET_SELECTION"; payload: Selection }
  | { type: "TOGGLE_MESSAGE"; payload: string }
  | { type: "SELECT_ALL_MESSAGES" }
  | { type: "DESELECT_ALL_MESSAGES" }
  | { type: "ADD_PAGE_BREAK"; payload: { afterMessageId: string } }
  | { type: "REMOVE_PAGE_BREAK"; payload: string }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_DECORATION"; payload: Partial<Decoration> }
  | { type: "SET_EXPORT_PARAMS"; payload: Partial<ExportParams> }
  | { type: "SET_AUTO_PAGINATION"; payload: boolean }
  | { type: "RESET" };

export type RuntimeAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PARSING"; payload: boolean }
  | { type: "SET_EXPORTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EXPORT_PROGRESS"; payload: number };

const defaultDecoration: Decoration = {
  canvasPaddingPx: 24,
  canvasRadiusPx: 12,
  shadowLevel: "md",
  backgroundType: "solid",
  backgroundValue: "#ffffff",
  macosBarEnabled: true,
};

const defaultExportParams: ExportParams = {
  scale: 2,
  canvasPreset: "portrait",
  canvasWidthPx: 800,
  maxPageHeightPx: 4096,
  outputMode: "single",
};

const initialEditorState: EditorState = {
  conversation: null,
  selection: null,
  selectedTheme: THEME_PRESETS[0]!,
  decoration: defaultDecoration,
  exportParams: defaultExportParams,
  autoPagination: false,
};

const initialRuntimeState: RuntimeState = {
  isLoading: false,
  isParsing: false,
  isExporting: false,
  error: null,
  exportProgress: 0,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_CONVERSATION":
      return { ...state, conversation: action.payload };

    case "SET_SELECTION":
      return { ...state, selection: action.payload };

    case "TOGGLE_MESSAGE": {
      if (!state.selection) return state;
      const { selectedMessageIds } = state.selection;
      const messageId = action.payload;
      const isSelected = selectedMessageIds.includes(messageId);
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedMessageIds: isSelected
            ? selectedMessageIds.filter((id) => id !== messageId)
            : [...selectedMessageIds, messageId],
        },
      };
    }

    case "SELECT_ALL_MESSAGES":
      if (!state.conversation || !state.selection) return state;
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedMessageIds: state.conversation.messages.map((m) => m.id),
        },
      };

    case "DESELECT_ALL_MESSAGES":
      if (!state.selection) return state;
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedMessageIds: [],
        },
      };

    case "ADD_PAGE_BREAK": {
      if (!state.selection) return state;
      const newPageBreak: PageBreak = {
        id: crypto.randomUUID(),
        afterMessageId: action.payload.afterMessageId,
        createdAt: new Date().toISOString(),
      };
      // Avoid duplicates
      if (
        state.selection.pageBreaks.some(
          (pb) => pb.afterMessageId === action.payload.afterMessageId
        )
      ) {
        return state;
      }
      return {
        ...state,
        selection: {
          ...state.selection,
          pageBreaks: [...state.selection.pageBreaks, newPageBreak],
        },
      };
    }

    case "REMOVE_PAGE_BREAK":
      if (!state.selection) return state;
      return {
        ...state,
        selection: {
          ...state.selection,
          pageBreaks: state.selection.pageBreaks.filter(
            (pb) => pb.id !== action.payload
          ),
        },
      };

    case "SET_THEME":
      return {
        ...state,
        selectedTheme: action.payload,
        decoration: { ...action.payload.decorationDefaults },
      };

    case "SET_DECORATION":
      return {
        ...state,
        decoration: { ...state.decoration, ...action.payload },
      };

    case "SET_EXPORT_PARAMS":
      return {
        ...state,
        exportParams: { ...state.exportParams, ...action.payload },
      };

    case "SET_AUTO_PAGINATION":
      return { ...state, autoPagination: action.payload };

    case "RESET":
      return initialEditorState;

    default:
      return state;
  }
}

function runtimeReducer(
  state: RuntimeState,
  action: RuntimeAction
): RuntimeState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_PARSING":
      return { ...state, isParsing: action.payload };
    case "SET_EXPORTING":
      return { ...state, isExporting: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_EXPORT_PROGRESS":
      return { ...state, exportProgress: action.payload };
    default:
      return state;
  }
}

// Context
export interface EditorContextValue {
  editor: EditorState;
  runtime: RuntimeState;
  dispatch: React.Dispatch<EditorAction>;
  runtimeDispatch: React.Dispatch<RuntimeAction>;
  actions: {
    toggleMessage: (messageId: string) => void;
    selectAllMessages: () => void;
    deselectAllMessages: () => void;
    addPageBreak: (afterMessageId: string) => void;
    removePageBreak: (pageBreakId: string) => void;
    setTheme: (theme: Theme) => void;
    setDecoration: (decoration: Partial<Decoration>) => void;
    setExportParams: (params: Partial<ExportParams>) => void;
    setAutoPagination: (enabled: boolean) => void;
  };
}

const EditorContext = createContext<EditorContextValue | null>(null);

// Storage key
const STORAGE_KEY = "chat2poster:preferences";

interface StoredPreferences {
  themeId: string;
  decoration: Decoration;
  exportParams: ExportParams;
  autoPagination: boolean;
}

function loadPreferences(): Partial<StoredPreferences> {
  try {
    if (typeof localStorage === "undefined") return {};
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Partial<StoredPreferences>;
    }
  } catch {
    // Ignore errors
  }
  return {};
}

function savePreferences(prefs: StoredPreferences): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore errors
  }
}

// Provider
export function EditorProvider({ children }: { children: ReactNode }) {
  const [editor, dispatch] = useReducer(editorReducer, initialEditorState, () => {
    const prefs = loadPreferences();
    const theme = THEME_PRESETS.find((t) => t.id === prefs.themeId) ?? THEME_PRESETS[0]!;
    return {
      ...initialEditorState,
      selectedTheme: theme,
      decoration: prefs.decoration ?? theme.decorationDefaults,
      exportParams: prefs.exportParams ?? defaultExportParams,
      autoPagination: prefs.autoPagination ?? false,
    };
  });

  const [runtime, runtimeDispatch] = useReducer(
    runtimeReducer,
    initialRuntimeState
  );

  // Save preferences when they change
  useEffect(() => {
    savePreferences({
      themeId: editor.selectedTheme.id,
      decoration: editor.decoration,
      exportParams: editor.exportParams,
      autoPagination: editor.autoPagination,
    });
  }, [
    editor.selectedTheme.id,
    editor.decoration,
    editor.exportParams,
    editor.autoPagination,
  ]);

  // Actions
  const toggleMessage = useCallback(
    (messageId: string) => dispatch({ type: "TOGGLE_MESSAGE", payload: messageId }),
    []
  );

  const selectAllMessages = useCallback(
    () => dispatch({ type: "SELECT_ALL_MESSAGES" }),
    []
  );

  const deselectAllMessages = useCallback(
    () => dispatch({ type: "DESELECT_ALL_MESSAGES" }),
    []
  );

  const addPageBreak = useCallback(
    (afterMessageId: string) =>
      dispatch({ type: "ADD_PAGE_BREAK", payload: { afterMessageId } }),
    []
  );

  const removePageBreak = useCallback(
    (pageBreakId: string) =>
      dispatch({ type: "REMOVE_PAGE_BREAK", payload: pageBreakId }),
    []
  );

  const setTheme = useCallback(
    (theme: Theme) => dispatch({ type: "SET_THEME", payload: theme }),
    []
  );

  const setDecoration = useCallback(
    (decoration: Partial<Decoration>) =>
      dispatch({ type: "SET_DECORATION", payload: decoration }),
    []
  );

  const setExportParams = useCallback(
    (params: Partial<ExportParams>) =>
      dispatch({ type: "SET_EXPORT_PARAMS", payload: params }),
    []
  );

  const setAutoPagination = useCallback(
    (enabled: boolean) =>
      dispatch({ type: "SET_AUTO_PAGINATION", payload: enabled }),
    []
  );

  const value: EditorContextValue = {
    editor,
    runtime,
    dispatch,
    runtimeDispatch,
    actions: {
      toggleMessage,
      selectAllMessages,
      deselectAllMessages,
      addPageBreak,
      removePageBreak,
      setTheme,
      setDecoration,
      setExportParams,
      setAutoPagination,
    },
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}
