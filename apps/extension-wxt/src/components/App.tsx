import { useState, useCallback } from "react";
import { EditorProvider } from "@/contexts/EditorContext";
import FloatingButton from "./FloatingButton";
import EditorPanel from "./EditorPanel";

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
