import './style.css';
import browser from 'webextension-polyfill';
import {
  ALL_SITES_ORIGINS,
  ensureContentScript,
  hasAllSitesAccess,
  supportsAllSitesOptIn,
} from '../../src/lib/inject';

const app = document.querySelector('#app')!;

app.innerHTML = `
  <h1>Image Reveal</h1>
  <p>Reveal images hidden in CSS backgrounds, overlays, and tiled viewers.</p>
  <button id="start-picker" type="button">Start element picker</button>
  <p class="hint" id="context-hint">Or right-click any page and choose <strong>Reveal images here</strong>.</p>
  <p class="error" id="popup-error" hidden></p>
`;

const errorEl = document.querySelector<HTMLParagraphElement>('#popup-error')!;

document.querySelector('#start-picker')?.addEventListener('click', async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await ensureContentScript(tab.id);
    await browser.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
    window.close();
  } catch {
    errorEl.textContent = "Image Reveal can't run on this page (browser pages and the web store are off limits).";
    errorEl.hidden = false;
  }
});

async function renderAllSitesToggle(): Promise<void> {
  if (!supportsAllSitesOptIn()) return;

  const hint = document.querySelector('#context-hint')!;
  hint.textContent = '';
  hint.append(
    'Or right-click and choose ',
    Object.assign(document.createElement('strong'), { textContent: 'Reveal images here' }),
    ', then click the image.',
  );

  const label = document.createElement('label');
  label.className = 'toggle';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'all-sites';
  checkbox.checked = await hasAllSitesAccess();
  const text = document.createElement('span');
  text.textContent =
    'Instant right-click on all sites (reveals exactly where you right-click, no extra click). Requires access to all sites.';
  label.append(checkbox, text);
  app.append(label);

  checkbox.addEventListener('change', async () => {
    try {
      if (checkbox.checked) {
        checkbox.checked = await browser.permissions.request({ origins: ALL_SITES_ORIGINS });
      } else {
        await browser.permissions.remove({ origins: ALL_SITES_ORIGINS });
      }
    } catch {
      checkbox.checked = await hasAllSitesAccess();
    }
  });
}

void renderAllSitesToggle();
