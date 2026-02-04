import {
  parseWithAdapters,
  registerBuiltinAdapters,
} from "@chat2poster/core-adapters";
import {
  EditorDataProvider,
  EditorModal,
  EditorProvider,
  FloatingButton,
  I18nProvider,
  useConversationExport,
} from "@chat2poster/shared-ui";
import { getLocaleFromNavigator } from "@chat2poster/shared-ui/i18n/core";
import { useCallback, useRef, useState } from "react";

registerBuiltinAdapters();

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const locale =
    typeof navigator !== "undefined"
      ? getLocaleFromNavigator(
          navigator.languages.length > 0
            ? navigator.languages
            : navigator.language,
        )
      : "en";

  const handleOpenPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  return (
    <I18nProvider locale={locale}>
      <EditorProvider>
        <ExtensionShell
          isPanelOpen={isPanelOpen}
          onOpenPanel={handleOpenPanel}
          onOpenChange={setIsPanelOpen}
        />
      </EditorProvider>
    </I18nProvider>
  );
}

function ExtensionShell({
  isPanelOpen,
  onOpenPanel,
  onOpenChange,
}: {
  isPanelOpen: boolean;
  onOpenPanel: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { exportConversation } = useConversationExport({ canvasRef });

  const handleParseConversation = useCallback(async () => {
    const result = await parseWithAdapters({
      type: "ext",
      document,
      url: window.location.href,
    });
    return result.conversation;
  }, []);

  return (
    <EditorDataProvider
      parseConversation={handleParseConversation}
      exportConversation={exportConversation}
    >
      <FloatingButton onClick={onOpenPanel} visible={!isPanelOpen} />
      <EditorModal
        open={isPanelOpen}
        onOpenChange={onOpenChange}
        canvasRef={canvasRef}
      />
    </EditorDataProvider>
  );
}
