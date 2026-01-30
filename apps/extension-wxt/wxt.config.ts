import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

export default defineConfig({
  manifest: {
    name: "Chat2Poster",
    description: "Turn AI chats into share-worthy posters",
    version: "0.0.1",
    permissions: ["activeTab", "storage"],
    host_permissions: [
      "https://chatgpt.com/*",
      "https://chat.openai.com/*",
      "https://claude.ai/*",
      "https://gemini.google.com/*",
    ],
  },
  srcDir: "src",
  outDir: "dist",
  webExt: {
    startUrls: ["https://chatgpt.com/"],
  },
  vite: () => ({
    plugins: [react()],
  }),
});
