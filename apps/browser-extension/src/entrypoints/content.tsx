import "./styles/globals.css";

import {
  EXTENSION_CONTENT_MATCHES,
  getExtensionSiteByHost,
  resolveExtensionTheme,
} from "@chat2poster/core-adapters";
import { createRoot } from "react-dom/client";
import App from "~/components/app";
import {
  CHAT2POSTER_COMPONENT_NAME,
  EXTENSION_RUNTIME_MESSAGE,
  EXTENSION_WINDOW_EVENT,
  type ExtensionRuntimeMessageType,
} from "~/constants/extension-runtime";

export default defineContentScript({
  matches: EXTENSION_CONTENT_MATCHES,
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
        const themeTarget =
          container instanceof HTMLElement ? container : wrapper;
        const eventTarget =
          container instanceof EventTarget ? container : wrapper;
        const stopPropagation = (event: Event) => {
          event.stopPropagation();
        };
        const eventTypes = ["wheel", "touchstart", "touchmove", "touchend"];
        eventTypes.forEach((type) => {
          eventTarget.addEventListener(type, stopPropagation);
        });

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        let activeSite = getExtensionSiteByHost(window.location.href);

        const applySiteTheme = (isDark: boolean) => {
          const theme = resolveExtensionTheme(activeSite, isDark);
          if (!theme) {
            themeTarget.style.removeProperty("--primary");
            themeTarget.style.removeProperty("--primary-foreground");
            themeTarget.style.removeProperty("--secondary");
            themeTarget.style.removeProperty("--secondary-foreground");
            return;
          }

          themeTarget.style.setProperty("--primary", theme.primary);
          themeTarget.style.setProperty(
            "--primary-foreground",
            theme.primaryForeground,
          );
          themeTarget.style.setProperty("--secondary", theme.secondary);
          themeTarget.style.setProperty(
            "--secondary-foreground",
            theme.secondaryForeground,
          );
        };

        const updateTheme = () => {
          const isDark =
            document.documentElement.classList.contains("dark") ||
            document.body.classList.contains("dark") ||
            prefersDark.matches;
          themeTarget.classList.toggle("dark", isDark);
          applySiteTheme(isDark);
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

        const notifyUrlChange = () => {
          activeSite = getExtensionSiteByHost(window.location.href);
          updateTheme();
          window.dispatchEvent(
            new CustomEvent(EXTENSION_WINDOW_EVENT.URL_CHANGE, {
              detail: { url: window.location.href },
            }),
          );
        };

        const originalPushState = history.pushState.bind(history);
        const originalReplaceState = history.replaceState.bind(history);
        history.pushState = function (...args) {
          originalPushState.apply(this, args);
          notifyUrlChange();
        };
        history.replaceState = function (...args) {
          originalReplaceState.apply(this, args);
          notifyUrlChange();
        };
        window.addEventListener("popstate", notifyUrlChange);
        notifyUrlChange();

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
            eventTypes.forEach((type) => {
              eventTarget.removeEventListener(type, stopPropagation);
            });
            browser.runtime.onMessage.removeListener(runtimeListener);
            observer.disconnect();
            prefersDark.removeEventListener("change", updateTheme);
            window.removeEventListener("popstate", notifyUrlChange);
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
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
