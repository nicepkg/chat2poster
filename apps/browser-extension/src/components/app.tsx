import {
  EditorProvider,
  FloatingButton,
  EditorPanel,
  I18nProvider,
} from "@chat2poster/shared-ui";
import { getLocaleFromNavigator } from "@chat2poster/shared-ui/i18n/core";
import { useState, useCallback } from "react";

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

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <I18nProvider locale={locale}>
      <EditorProvider>
        <FloatingButton onClick={handleOpenPanel} visible={!isPanelOpen} />
        <EditorPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
      </EditorProvider>
    </I18nProvider>
  );
}
