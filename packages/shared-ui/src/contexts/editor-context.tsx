"use client";

import {
  EXPORT_DEFAULTS,
  type Conversation,
  type Selection,
  type Decoration,
  type ExportParams,
  type PageBreak,
  type Theme,
} from "@chat2poster/core-schema";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "~/constants";
import { THEME_PRESETS, BACKGROUND_PRESETS } from "~/themes";
import { generateUUID } from "~/utils/uuid";

// Re-export for backward compatibility
export { THEME_PRESETS, BACKGROUND_PRESETS };

// State types
export interface EditorState {
  conversation: Conversation | null;
  selection: Selection | null;
  selectedTheme: Theme;
  decoration: Decoration;
  exportParams: ExportParams;
  autoPagination: boolean;
  /** Current page index for preview (0-based) */
  currentPage: number;
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
  | { type: "SET_CURRENT_PAGE"; payload: number }
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
  scale: EXPORT_DEFAULTS.SCALE,
  deviceType: EXPORT_DEFAULTS.DEVICE_TYPE,
  maxPageHeightPx: EXPORT_DEFAULTS.MAX_PAGE_HEIGHT_PX,
  outputMode: EXPORT_DEFAULTS.OUTPUT_MODE,
};

const initialEditorState: EditorState = {
  conversation: null,
  selection: null,
  selectedTheme: THEME_PRESETS[0]!,
  decoration: defaultDecoration,
  exportParams: defaultExportParams,
  autoPagination: false,
  currentPage: 0,
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
        id: generateUUID(),
        afterMessageId: action.payload.afterMessageId,
        createdAt: new Date().toISOString(),
      };
      // Avoid duplicates
      if (
        state.selection.pageBreaks.some(
          (pb) => pb.afterMessageId === action.payload.afterMessageId,
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
            (pb) => pb.id !== action.payload,
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

    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };

    case "RESET":
      return initialEditorState;

    default:
      return state;
  }
}

function runtimeReducer(
  state: RuntimeState,
  action: RuntimeAction,
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
    setCurrentPage: (page: number) => void;
  };
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface StoredPreferences {
  themeId: string;
  decoration: Decoration;
  exportParams: ExportParams;
  autoPagination: boolean;
}

function loadPreferences(): Partial<StoredPreferences> {
  try {
    if (typeof localStorage === "undefined") return {};
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
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
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch {
    // Ignore errors
  }
}

// Provider
export function EditorProvider({ children }: { children: ReactNode }) {
  const [editor, dispatch] = useReducer(
    editorReducer,
    initialEditorState,
    () => {
      const prefs = loadPreferences();
      const theme =
        THEME_PRESETS.find((t) => t.id === prefs.themeId) ?? THEME_PRESETS[0]!;
      return {
        ...initialEditorState,
        selectedTheme: theme,
        decoration: prefs.decoration ?? theme.decorationDefaults,
        exportParams: prefs.exportParams ?? defaultExportParams,
        autoPagination: prefs.autoPagination ?? false,
      };
    },
  );

  const [runtime, runtimeDispatch] = useReducer(
    runtimeReducer,
    initialRuntimeState,
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
    (messageId: string) =>
      dispatch({ type: "TOGGLE_MESSAGE", payload: messageId }),
    [],
  );

  const selectAllMessages = useCallback(
    () => dispatch({ type: "SELECT_ALL_MESSAGES" }),
    [],
  );

  const deselectAllMessages = useCallback(
    () => dispatch({ type: "DESELECT_ALL_MESSAGES" }),
    [],
  );

  const addPageBreak = useCallback(
    (afterMessageId: string) =>
      dispatch({ type: "ADD_PAGE_BREAK", payload: { afterMessageId } }),
    [],
  );

  const removePageBreak = useCallback(
    (pageBreakId: string) =>
      dispatch({ type: "REMOVE_PAGE_BREAK", payload: pageBreakId }),
    [],
  );

  const setTheme = useCallback(
    (theme: Theme) => dispatch({ type: "SET_THEME", payload: theme }),
    [],
  );

  const setDecoration = useCallback(
    (decoration: Partial<Decoration>) =>
      dispatch({ type: "SET_DECORATION", payload: decoration }),
    [],
  );

  const setExportParams = useCallback(
    (params: Partial<ExportParams>) =>
      dispatch({ type: "SET_EXPORT_PARAMS", payload: params }),
    [],
  );

  const setAutoPagination = useCallback(
    (enabled: boolean) =>
      dispatch({ type: "SET_AUTO_PAGINATION", payload: enabled }),
    [],
  );

  const setCurrentPage = useCallback(
    (page: number) => dispatch({ type: "SET_CURRENT_PAGE", payload: page }),
    [],
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
      setCurrentPage,
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
