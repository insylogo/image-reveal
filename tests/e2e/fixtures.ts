import { test as base, chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const distChrome = path.join(root, '.output', 'chrome-mv3');
// Test copy of the Chrome build with all-sites access pre-granted, standing in
// for a user who enabled the opt-in (permissions.request needs a real click).
function ensureBuilt(workerIndex: number): string {
  const distChromeTest = path.join(root, '.output', `chrome-mv3-e2e-${workerIndex}`);
  if (!fs.existsSync(distChrome)) {
    execSync('npm run build:chrome', { cwd: root, stdio: 'inherit' });
  }
  fs.rmSync(distChromeTest, { recursive: true, force: true });
  fs.cpSync(distChrome, distChromeTest, { recursive: true });
  const manifestPath = path.join(distChromeTest, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.host_permissions = ['<all_urls>'];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  return distChromeTest;
}

type Fixtures = {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  page: Page;
};

export const test = base.extend<Fixtures>({
  context: async ({}, use, testInfo) => {
    const distChromeTest = ensureBuilt(testInfo.parallelIndex);
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: false,
      args: [
        `--disable-extensions-except=${distChromeTest}`,
        `--load-extension=${distChromeTest}`,
      ],
    });
    await use(context);
    await context.close();
  },
  serviceWorker: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    await use(serviceWorker);
  },
  extensionId: async ({ serviceWorker }, use) => {
    await use(serviceWorker.url().split('/')[2]);
  },
  page: async ({ context }, use) => {
    const page = context.pages()[0] ?? (await context.newPage());
    await use(page);
  },
});

export { expect } from '@playwright/test';
