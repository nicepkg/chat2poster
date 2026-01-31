import "./styles/globals.css";

import { createRoot } from "react-dom/client";
import App from "~/components/app";

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
      name: "chat2poster-panel",
      position: "inline",
      anchor: "body",
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
        return {
          root,
          wrapper,
          cleanup: () => {
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
