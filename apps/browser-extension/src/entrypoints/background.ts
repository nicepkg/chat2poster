import {
  EXTENSION_RUNTIME_MESSAGE,
  isSupportedTabUrl,
} from "~/constants/extension-runtime";

async function sendToggleMessageToTab(tabId: number): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, {
      type: EXTENSION_RUNTIME_MESSAGE.TOGGLE_PANEL,
    });
  } catch {
    // Ignore tabs without mounted content script.
  }
}

async function getActiveTab() {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tabs[0] ?? null;
}

export default defineBackground(() => {
  browser.action.onClicked.addListener((tab) => {
    void (async () => {
      if (!tab.id || !isSupportedTabUrl(tab.url)) return;
      await sendToggleMessageToTab(tab.id);
    })();
  });

  browser.commands.onCommand.addListener((command) => {
    void (async () => {
      if (command !== "toggle-panel") return;
      const tab = await getActiveTab();
      if (!tab?.id || !isSupportedTabUrl(tab.url)) return;
      await sendToggleMessageToTab(tab.id);
    })();
  });
});
