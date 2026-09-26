import browser from 'webextension-polyfill';

export const CONTENT_SCRIPT_FILE = 'content-scripts/content.js';
export const ALL_SITES_SCRIPT_ID = 'image-reveal-all-sites';
export const ALL_SITES_ORIGINS = ['<all_urls>'];

export type ContentScriptState = 'existing' | 'injected';

/**
 * Makes sure the content script is running in the tab.
 * 'existing' means it was already there (so it saw the last right-click position),
 * 'injected' means it was just injected on demand (activeTab grant).
 */
export async function ensureContentScript(tabId: number): Promise<ContentScriptState> {
  try {
    const reply = await browser.tabs.sendMessage(tabId, { type: 'PING' });
    if (reply === 'PONG') return 'existing';
  } catch {
    // No receiver in the tab, inject below.
  }
  await browser.scripting.executeScript({
    target: { tabId },
    files: [CONTENT_SCRIPT_FILE],
  });
  return 'injected';
}

/** True when the build declares the optional all-sites permission (Chrome build). */
export function supportsAllSitesOptIn(): boolean {
  const manifest = browser.runtime.getManifest() as { optional_host_permissions?: string[] };
  return Boolean(manifest.optional_host_permissions?.includes('<all_urls>'));
}

export async function hasAllSitesAccess(): Promise<boolean> {
  return browser.permissions.contains({ origins: ALL_SITES_ORIGINS });
}

/** Registers or unregisters the always-on content script to match the granted permission. */
export async function syncAllSitesScript(): Promise<void> {
  if (!supportsAllSitesOptIn()) return;
  const granted = await hasAllSitesAccess();
  const existing = await browser.scripting.getRegisteredContentScripts({ ids: [ALL_SITES_SCRIPT_ID] });
  if (granted && existing.length === 0) {
    await browser.scripting.registerContentScripts([
      {
        id: ALL_SITES_SCRIPT_ID,
        matches: ALL_SITES_ORIGINS,
        js: [CONTENT_SCRIPT_FILE],
        runAt: 'document_idle',
      },
    ]);
  } else if (!granted && existing.length > 0) {
    await browser.scripting.unregisterContentScripts({ ids: [ALL_SITES_SCRIPT_ID] });
  }
}
