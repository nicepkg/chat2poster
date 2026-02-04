import "./styles/globals.css";

import { createRoot } from "react-dom/client";
import App from "~/components/app";
import {
  CHAT2POSTER_COMPONENT_NAME,
  EXTENSION_RUNTIME_MESSAGE,
  EXTENSION_WINDOW_EVENT,
  type ExtensionRuntimeMessageType,
} from "~/constants/extension-runtime";

export default defineContentScript({
  matches: [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: CHAT2POSTER_COMPONENT_NAME,
      position: "overlay",
      anchor: "body",
      append: "first",
      zIndex: 99999,
      onMount(container) {
        const wrapper = document.createElement("div");
        wrapper.id = "chat2poster-root";
        container.appendChild(wrapper);

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        const updateTheme = () => {
          const isDark =
            document.documentElement.classList.contains("dark") ||
            document.body.classList.contains("dark") ||
            prefersDark.matches;
          wrapper.classList.toggle("dark", isDark);
        };
        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });
        prefersDark.addEventListener("change", updateTheme);

        const root = createRoot(wrapper);
        root.render(<App />);

        const runtimeListener = (message: unknown, _sender: unknown) => {
          const messageType =
            typeof message === "object" && message !== null && "type" in message
              ? (message.type as ExtensionRuntimeMessageType)
              : null;

          if (!messageType) return undefined;

          if (messageType === EXTENSION_RUNTIME_MESSAGE.TOGGLE_PANEL) {
            window.dispatchEvent(
              new Event(EXTENSION_WINDOW_EVENT.TOGGLE_PANEL),
            );
            return undefined;
          }
          if (messageType === EXTENSION_RUNTIME_MESSAGE.OPEN_PANEL) {
            window.dispatchEvent(new Event(EXTENSION_WINDOW_EVENT.OPEN_PANEL));
            return undefined;
          }
          if (messageType === EXTENSION_RUNTIME_MESSAGE.CLOSE_PANEL) {
            window.dispatchEvent(new Event(EXTENSION_WINDOW_EVENT.CLOSE_PANEL));
            return undefined;
          }

          return undefined;
        };

        browser.runtime.onMessage.addListener(runtimeListener);
        return {
          root,
          wrapper,
          cleanup: () => {
            browser.runtime.onMessage.removeListener(runtimeListener);
            observer.disconnect();
            prefersDark.removeEventListener("change", updateTheme);
          },
        };
      },
      onRemove(elements) {
        if (!elements) return;
        elements.cleanup();
        elements.root.unmount();
        elements.wrapper.remove();
      },
    });

    ui.mount();
  },
});
