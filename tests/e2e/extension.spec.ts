import { test, expect } from './fixtures';

const FIXTURE_BASE = 'http://localhost:4173/pages';

test.describe('fixture extraction via DOM helpers', () => {
  test('background-div reveals css background', async ({ page }) => {
    await page.goto(`${FIXTURE_BASE}/background-div.html`);
    const urls = await page.evaluate(() => {
      const el = document.querySelector('#target')!;
      const bg = getComputedStyle(el).backgroundImage;
      const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
      return m ? [m[1]] : [];
    });
    expect(urls[0]).toContain('hero-bg.jpg');
  });

  test('overlay-stack reveals img under transparent overlay', async ({ page }) => {
    await page.goto(`${FIXTURE_BASE}/overlay-stack.html`);
    const urls = await page.evaluate(() => {
      const overlay = document.querySelector('[data-testid="overlay"]')!;
      const rect = overlay.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const stack = document.elementsFromPoint(x, y);
      const urls: string[] = [];
      for (const el of stack) {
        if (el instanceof HTMLImageElement && el.src) urls.push(el.src);
        el.querySelectorAll('img').forEach((img) => {
          if (img.src) urls.push(img.src);
        });
      }
      const hidden = document.querySelector('[data-testid="hidden-img"]') as HTMLImageElement;
      if (hidden?.src) urls.push(hidden.src);
      return [...new Set(urls)];
    });
    expect(urls.some((u) => u.includes('hidden-under-overlay.jpg'))).toBe(true);
  });

  test('lazy-data-attrs reveals data attributes', async ({ page }) => {
    await page.goto(`${FIXTURE_BASE}/lazy-data-attrs.html`);
    const urls = await page.evaluate(() => {
      const el = document.querySelector('#target')!;
      return [
        el.getAttribute('data-background-image'),
        el.getAttribute('data-src'),
      ].filter(Boolean) as string[];
    });
    expect(urls.some((u) => u.includes('not-applied-yet.jpg'))).toBe(true);
    expect(urls.some((u) => u.includes('lazy-src.jpg'))).toBe(true);
  });

  test('srcset fixture has largest webp', async ({ page }) => {
    await page.goto(`${FIXTURE_BASE}/srcset-img.html`);
    const url = await page.evaluate(() => {
      const source = document.querySelector('source')!;
      const srcset = source.getAttribute('srcset')!;
      const parts = srcset.split(',').map((p) => p.trim().split(/\s+/));
      parts.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
      return parts[0][0];
    });
    expect(url).toContain('photo-1920.webp');
  });

  test('shadow-dom fixture exposes background in shadow root', async ({ page }) => {
    await page.goto(`${FIXTURE_BASE}/shadow-dom.html`);
    const url = await page.evaluate(() => {
      const host = document.querySelector('#host')!;
      const inner = host.shadowRoot!.querySelector('.inner')!;
      const bg = getComputedStyle(inner).backgroundImage;
      const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
      return m?.[1] ?? '';
    });
    expect(url).toContain('shadow-bg.png');
  });

  test('nara-style IIIF tile URLs parse to full image', async ({ page }) => {
    await page.goto(`${FIXTURE_BASE}/nara-iiif.html`);
    const fullUrl = await page.evaluate(() => {
      const tile =
        'https://catalog.archives.gov/iiif/3/opastorage%2Flive%2Fsample%2Fimage.jpg/0,0,1000,800/256,205/0/default.jpg';
      const m = tile.match(/^(https?:\/\/[^/]+(?:\/[^/]+)*\/iiif\/\d+\/[^/]+)/i);
      return m ? `${m[1]}/full/max/0/default.jpg` : '';
    });
    expect(fullUrl).toContain('catalog.archives.gov/iiif/3/');
    expect(fullUrl).toContain('/full/max/0/default.jpg');
  });
});

test.describe('extension loaded', () => {
  test('service worker is active', async ({ context, extensionId }) => {
    expect(extensionId).toBeTruthy();
    const workers = context.serviceWorkers();
    expect(workers.length).toBeGreaterThan(0);
  });

  test('content script opens results panel via message', async ({ page, serviceWorker: sw }) => {
    // Opt-in path: background registers the always-on script once access is granted.
    await expect
      .poll(() =>
        sw.evaluate(async () =>
          (await chrome.scripting.getRegisteredContentScripts()).map((s) => s.id),
        ),
      )
      .toContain('image-reveal-all-sites');

    await page.goto(`${FIXTURE_BASE}/background-div.html`);

    const panelVisible = await sw.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return false;
      await chrome.tabs.sendMessage(tab.id, {
        type: 'REVEAL_AT_POINT',
        x: 200,
        y: 100,
      });
      return true;
    });

    expect(panelVisible).toBe(true);
    await page.waitForSelector('#image-reveal-panel', { timeout: 5000 });
    const text = await page.locator('#image-reveal-panel').textContent();
    expect(text).toContain('hero-bg.jpg');
  });

  test('on-demand injection starts picker and ignores double injection', async ({ page, serviceWorker: sw }) => {
    await expect
      .poll(() => sw.evaluate(async () => (await chrome.scripting.getRegisteredContentScripts()).length))
      .toBeGreaterThan(0);
    // Drop the registered script so the page loads without it, like a
    // default (activeTab-only) install.
    await sw.evaluate(() => chrome.scripting.unregisterContentScripts());
    await page.goto(`${FIXTURE_BASE}/background-div.html`);

    const result = await sw.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tab!.id!;
      let before = 'none';
      try {
        before = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      } catch {
        before = 'none';
      }
      for (let i = 0; i < 2; i++) {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content-scripts/content.js'] });
      }
      const after = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      await chrome.tabs.sendMessage(tabId, { type: 'START_PICKER' });
      return { before, after };
    });

    expect(result).toEqual({ before: 'none', after: 'PONG' });
    await page.waitForSelector('[data-image-reveal="picker"]', { state: 'attached', timeout: 5000 });
    await page.mouse.click(200, 100);
    await page.waitForSelector('#image-reveal-panel', { timeout: 5000 });
    expect(await page.locator('#image-reveal-panel').textContent()).toContain('hero-bg.jpg');
    // Double injection must not create duplicate panels.
    expect(await page.locator('#image-reveal-panel').count()).toBe(1);
  });
});
