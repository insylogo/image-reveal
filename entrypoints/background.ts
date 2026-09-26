import browser from 'webextension-polyfill';
import type { MessageType } from '../src/lib/types';
import { CONTEXT_MENU_ID } from '../src/lib/types';
import { filenameFromUrl } from '../src/lib/url-utils';
import { ensureContentScript, syncAllSitesScript } from '../src/lib/inject';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.removeAll().then(() => {
      browser.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: 'Reveal images here',
        contexts: ['all'],
      });
    });
    void syncAllSitesScript().catch(() => undefined);
  });

  browser.runtime.onStartup.addListener(() => {
    void syncAllSitesScript().catch(() => undefined);
  });

  // Keep the always-on script in sync if the user grants or revokes all-sites
  // access from the popup or from chrome://extensions.
  browser.permissions.onAdded.addListener(() => {
    void syncAllSitesScript().catch(() => undefined);
  });
  browser.permissions.onRemoved.addListener(() => {
    void syncAllSitesScript().catch(() => undefined);
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) return;

    const clickInfo = info as browser.Menus.OnClickData & {
      pageX?: number;
      pageY?: number;
    };

    // If the script was already on the page it recorded the right-click point.
    // If it was just injected (activeTab), it never saw the click, so let the
    // user pick the element instead.
    const state = await ensureContentScript(tab.id);
    if (state === 'injected') {
      await browser.tabs.sendMessage(tab.id, { type: 'START_PICKER' } satisfies MessageType);
      return;
    }

    await browser.tabs.sendMessage(tab.id, {
      type: 'REVEAL_AT_POINT',
      x: clickInfo.pageX ?? 0,
      y: clickInfo.pageY ?? 0,
    } satisfies MessageType);
  });

  browser.runtime.onMessage.addListener((message: unknown, sender: browser.Runtime.MessageSender) => {
    const msg = message as MessageType;
    if (msg.type === 'OPEN_URL') {
      browser.tabs.create({ url: msg.url });
      return Promise.resolve();
    }

    if (msg.type === 'OPEN_ALL_URLS') {
      for (const url of msg.urls) {
        void browser.tabs.create({ url });
      }
      return Promise.resolve();
    }

    if (msg.type === 'DOWNLOAD_URL') {
      return browser.downloads.download({
        url: msg.url,
        filename: msg.filename ?? filenameFromUrl(msg.url),
        saveAs: false,
      });
    }

    if (msg.type === 'DOWNLOAD_ALL_URLS') {
      for (const url of msg.urls) {
        void browser.downloads.download({
          url,
          filename: filenameFromUrl(url),
          saveAs: false,
        });
      }
      return Promise.resolve();
    }

    if (msg.type === 'COPY_URL' && sender.tab?.id) {
      return browser.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: (url: string) => navigator.clipboard.writeText(url),
        args: [msg.url],
      });
    }

    return undefined;
  });
});
