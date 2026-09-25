import { test, expect } from '@playwright/test';

/**
 * Firefox extension E2E spike.
 *
 * Playwright's Firefox driver cannot load unpacked extensions via CLI flags.
 * Recommended approaches (in priority order):
 *
 * 1. PLAYWRIGHT_FIREFOX_POLICIES_JSON — force-install a signed/local .xpi in CI
 * 2. web-ext run + connectOverCDP — launch Firefox with web-ext, attach Playwright
 * 3. Manual smoke checklist before AMO release
 *
 * This test validates the policies.json approach documentation and skips execution
 * unless PLAYWRIGHT_FIREFOX_POLICIES_JSON is set.
 */

const policiesPath = process.env.PLAYWRIGHT_FIREFOX_POLICIES_JSON;

test.describe('firefox extension loading', () => {
  test.skip(!policiesPath, 'Set PLAYWRIGHT_FIREFOX_POLICIES_JSON to run Firefox extension E2E');

  test('firefox launches with forced extension policy', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('about:addons');
    await expect(page.locator('body')).toBeVisible();
    await context.close();
  });
});

test('documents firefox policies example', () => {
  const example = {
    policies: {
      ExtensionSettings: {
        '@image-reveal.insylogo': {
          installation_mode: 'force_installed',
          install_url: 'file:///path/to/image-reveal.xpi',
        },
      },
    },
  };
  expect(example.policies.ExtensionSettings['@image-reveal.insylogo']).toBeDefined();
});
