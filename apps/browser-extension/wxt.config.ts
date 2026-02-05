import { EXTENSION_HOST_PERMISSIONS } from "@chat2poster/core-adapters";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "wxt";
import { toUtf8 } from "./scripts/vite-plugin-to-utf8";

export default defineConfig({
  manifest: {
    name: "Chat2Poster",
    description: "Turn AI chats into share-worthy posters",
    version: "0.0.1",
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self';",
    },
    permissions: ["activeTab", "storage", "tabs"],
    host_permissions: EXTENSION_HOST_PERMISSIONS,
    action: {
      default_title: "Chat2Poster",
    },
    commands: {
      "toggle-panel": {
        suggested_key: {
          default: "Ctrl+Shift+Y",
          mac: "Command+Shift+Y",
        },
        description: "Toggle Chat2Poster panel",
      },
    },
  },
  srcDir: "src",
  outDir: "dist",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [toUtf8(), tailwindcss(), tsconfigPaths()],
    resolve: {
      // Force package imports to use published/dist branches instead of
      // `development` source conditions in workspace packages.
      conditions: ["development", "import", "browser", "default"],
    },
    optimizeDeps: {
      exclude: ["@chat2poster/shared-ui", "@chat2poster/core-adapters"],
    },
    build: {
      sourcemap: false,
    },
  }),
});
