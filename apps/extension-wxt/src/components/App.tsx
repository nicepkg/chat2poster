import {
  EditorProvider,
  FloatingButton,
  EditorPanel,
} from "@chat2poster/shared-ui";
import { useState, useCallback } from "react";

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleOpenPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <EditorProvider>
      <FloatingButton onClick={handleOpenPanel} visible={!isPanelOpen} />
      <EditorPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
    </EditorProvider>
  );
}
