import browser from 'webextension-polyfill';
import type { MessageType } from '../src/lib/types';
import { downloadUrlInPageContext, openUrlInPageContext, openUrlsInPageContext } from '../src/lib/page-image-fetch';
import { downloadStitchedIiifImage } from '../src/lib/iiif-stitch';
import { downloadStitchedDziImage } from '../src/lib/dzi';
import { revealAtPoint } from '../src/lib/reveal';
import { filenameFromUrl } from '../src/lib/url-utils';
import { PickerOverlay } from '../src/ui/picker-overlay';
import { ResultsPanel } from '../src/ui/results-panel';

export default defineContentScript({
  // Empty on Chrome so WXT doesn't add <all_urls> to host_permissions.
  matches: { firefox: ['<all_urls>'], chrome: [], edge: [] },
  runAt: 'document_idle',
  // Chrome: injected on demand via activeTab, or registered at runtime when the
  // user opts in to all-sites access. Firefox keeps the manifest content script.
  registration: { chrome: 'runtime', edge: 'runtime' },

  main() {
    const flagged = window as unknown as { __imageRevealLoaded?: boolean };
    if (flagged.__imageRevealLoaded) return;
    flagged.__imageRevealLoaded = true;

    const picker = new PickerOverlay();
    const panel = new ResultsPanel();
    let lastContextCoords = { x: 0, y: 0 };

    document.addEventListener(
      'contextmenu',
      (e) => {
        lastContextCoords = { x: e.clientX, y: e.clientY };
      },
      true,
    );

    function handlePanelAction(msg: MessageType): void {
      if (msg.type === 'OPEN_URL') {
        void openUrlInPageContext(msg.url).catch((error) => {
          panel.showActionError(
            msg.url,
            error instanceof Error ? error.message : 'Open failed',
          );
        });
        return;
      }

      if (msg.type === 'OPEN_ALL_URLS') {
        void openUrlsInPageContext(msg.urls, (url, message) => {
          panel.showActionError(url, message);
        });
        return;
      }

      if (msg.type === 'DOWNLOAD_URL') {
        void downloadUrlInPageContext(msg.url, msg.filename).catch((error) => {
          panel.showActionError(
            msg.url,
            error instanceof Error ? error.message : 'Download failed',
          );
          void browser.runtime.sendMessage(msg);
        });
        return;
      }

      if (msg.type === 'DOWNLOAD_ALL_URLS') {
        for (const url of msg.urls) {
          void downloadUrlInPageContext(url).catch((error) => {
            panel.showActionError(
              url,
              error instanceof Error ? error.message : 'Download failed',
            );
            void browser.runtime.sendMessage({
              type: 'DOWNLOAD_URL',
              url,
              filename: filenameFromUrl(url),
            });
          });
        }
        return;
      }

      if (msg.type === 'STITCH_IIIF') {
        panel.clearActionMessage(msg.rowUrl);
        panel.showActionStatus(msg.rowUrl, 'Preparing tile download…');
        void downloadStitchedIiifImage(msg.base, ({ completed, total }) => {
          panel.showActionStatus(msg.rowUrl, `Stitching tiles ${completed}/${total}…`);
        })
          .then((filename) => {
            panel.showActionStatus(msg.rowUrl, `Saved ${filename}`);
            window.setTimeout(() => panel.clearActionMessage(msg.rowUrl), 4000);
          })
          .catch((error) => {
            panel.showActionError(
              msg.rowUrl,
              error instanceof Error ? error.message : 'Stitch failed',
            );
          });
        return;
      }

      if (msg.type === 'STITCH_DZI') {
        panel.clearActionMessage(msg.rowUrl);
        panel.showActionStatus(msg.rowUrl, 'Preparing tile download…');
        void downloadStitchedDziImage(msg.url, ({ completed, total }) => {
          panel.showActionStatus(msg.rowUrl, `Stitching tiles ${completed}/${total}…`);
        })
          .then((filename) => {
            panel.showActionStatus(msg.rowUrl, `Saved ${filename}`);
            window.setTimeout(() => panel.clearActionMessage(msg.rowUrl), 4000);
          })
          .catch((error) => {
            panel.showActionError(
              msg.rowUrl,
              error instanceof Error ? error.message : 'Stitch failed',
            );
          });
        return;
      }

      void browser.runtime.sendMessage(msg);
    }

    async function handleReveal(x: number, y: number): Promise<void> {
      const result = await revealAtPoint(x, y);
      panel.add(result, handlePanelAction);
    }

    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as MessageType;
      if (msg.type === 'PING') {
        return Promise.resolve('PONG');
      }

      if (msg.type === 'START_PICKER') {
        picker.start((x, y) => {
          void handleReveal(x, y);
          browser.runtime.sendMessage({ type: 'PICKER_ACTIVE', active: false });
        });
        browser.runtime.sendMessage({ type: 'PICKER_ACTIVE', active: true });
        return Promise.resolve();
      }

      if (msg.type === 'STOP_PICKER') {
        picker.stop();
        return Promise.resolve();
      }

      if (msg.type === 'REVEAL_AT_POINT') {
        const x = msg.x || lastContextCoords.x;
        const y = msg.y || lastContextCoords.y;
        void handleReveal(x, y);
        return Promise.resolve();
      }

      return undefined;
    });
  },
});
