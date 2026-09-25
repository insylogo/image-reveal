# Firefox Add-ons (AMO) listing — Image Reveal

Paste-ready metadata for the [AMO developer hub](https://addons.mozilla.org/developers/).  
Adjust URLs before submit (privacy policy, support, homepage).

---

## Add-on name

**Image Reveal**

---

## Summary (max 250 characters)

Use this in the **Summary** field:

```
Find and save images you can't right-click — CSS backgrounds, overlays, lazy-loaded URLs, and full-resolution IIIF tiles from museum and archive viewers. Local only; no tracking.
```

**Character count:** 174

### Alternate summaries (pick one)

**Archive / museum focus (248 chars):**
```
Reveal hidden image URLs: CSS background-image, overlays, data-src lazy load, and IIIF full resolution from tiled viewers (National Archives, museums). Open, copy, or download — all local.
```

**Problem-first (231 chars):**
```
Can't "Save image as" on a site? Reveal the real URL — backgrounds, transparent overlays, srcset, shadow DOM, and IIIF pan/zoom viewers. Right-click or use the element picker.
```

---

## Add-on URL slug (if prompted)

`image-reveal`

---

## Categories

| Priority | Category | Why |
|----------|----------|-----|
| **Primary** | Photos | Core use case: find, open, download images |
| **Secondary** | Download Management | Download / download-all actions |
| **Optional third** | Developer Tools | DOM/CSS inspection angle for technical users |

---

## Tags (search keywords on AMO)

Select all that fit AMO’s tag picker; add custom tags if the form allows:

```
image
download
css
background-image
iiif
openseadragon
archive
museum
lazy-load
srcset
overlay
extract
save image
full resolution
```

**Suggested tag set (if limited to ~10):**  
`image`, `download`, `css`, `iiif`, `archive`, `museum`, `lazy-load`, `overlay`, `srcset`, `save image`

---

## Full description

AMO supports limited HTML (`<p>`, `<ul>`, `<li>`, `<strong>`, `<a>`, `<br>`). Paste below into **Description**:

```html
<p><strong>Image Reveal</strong> finds image URLs that websites show on screen but hide from “Save image as” — because the picture lives in a CSS <code>background-image</code>, under a transparent overlay, in lazy-load <code>data-*</code> attributes, or inside a tiled IIIF / OpenSeadragon pan-zoom viewer instead of a normal <code>&lt;img&gt;</code> tag.</p>

<p>If you have ever tried to download a hero banner, a museum artwork, or a National Archives record and only got a thumbnail — or nothing at all — this extension is built for that.</p>

<h3>How to use</h3>
<ul>
  <li><strong>Right-click</strong> anywhere on the page → <strong>Reveal images here</strong></li>
  <li>Or click the toolbar icon → <strong>Start element picker</strong> → click the visual you want → <strong>Esc</strong> to cancel</li>
</ul>
<p>A results panel lists every unique URL found at that point. For each image you can <strong>Open</strong>, <strong>Copy URL</strong>, or <strong>Download</strong>. Use <strong>Open all</strong> or <strong>Download all</strong> for the full list. Repeated reveals add to the same panel until you close it.</p>

<h3>What it can reveal</h3>
<ul>
  <li>CSS <code>background-image</code>, <code>image-set()</code>, masks, and <code>::before</code> / <code>::after</code> pseudo-elements</li>
  <li>Images buried under transparent overlays (stack picking at your cursor)</li>
  <li><code>&lt;img&gt;</code>, <code>&lt;picture&gt;</code>, and largest <code>srcset</code> candidates</li>
  <li>Lazy-load attributes: <code>data-src</code>, <code>data-background-image</code>, <code>data-bg</code>, and similar</li>
  <li>CSS variables such as <code>--bg-image</code></li>
  <li>Open shadow DOM (closed shadow roots are not supported)</li>
  <li><strong>IIIF</strong> full-resolution URLs from tiled viewers — e.g. National Archives Catalog, Swedish Nationalmuseum, and other OpenSeadragon / IIIF sites</li>
  <li><strong>Stitch full res</strong> — for large tiled IIIF images, download all tiles and assemble one full-resolution file in the browser</li>
  <li>Video posters, inline SVG images, blob and data URLs</li>
</ul>

<h3>Good fits</h3>
<ul>
  <li>Archive and museum collection sites with pan-zoom viewers</li>
  <li>News and marketing sites with CSS hero images</li>
  <li>Social and gallery layouts with overlay stacks</li>
  <li>Lazy-loaded galleries and carousels</li>
</ul>

<h3>Limitations</h3>
<ul>
  <li>Does not bypass DRM, login walls, or paywalls</li>
  <li>Canvas / WebGL content without a discoverable URL is not supported</li>
  <li>Cross-origin iframes and closed shadow DOM are not supported</li>
  <li>On IIIF sites, wait for the viewer to load tiles before revealing</li>
  <li>Some hosts require page context (Referer/cookies) to download — the extension handles this when you use Open or Download from the panel</li>
</ul>

<h3>Privacy</h3>
<p>Runs only when <strong>you</strong> invoke it (context menu or picker). No background scanning. No analytics. No accounts. No data is sent to the developer. Image hosts are contacted only when you choose Open or Download.</p>
<p>Privacy policy: <a href="https://github.com/insylogo/background-reveal/blob/main/PRIVACY.md">https://github.com/insylogo/background-reveal/blob/main/PRIVACY.md</a></p>
<p>Source code: <a href="https://github.com/insylogo/background-reveal">https://github.com/insylogo/background-reveal</a> (MIT)</p>
```

### Plain-text version (if HTML is stripped)

Use the HTML version above when possible. If the form is plain text only, use the same sections without tags.

---

## Homepage

```
https://github.com/insylogo/background-reveal
```

Or your project site if you add one later.

---

## Support / issues URL

```
https://github.com/insylogo/background-reveal/issues
```

---

## Privacy policy URL

**Required — must be a live HTTPS URL before submit.**

Options:

```
https://github.com/insylogo/background-reveal/blob/main/PRIVACY.md
```

Or GitHub Pages / your domain if you prefer a cleaner URL.

---

## License

**MIT** (matches repository `LICENSE`)

Third-party: includes **webextension-polyfill** (MPL-2.0). See `THIRD_PARTY_NOTICES.md` in the repo.

---

## Notes for reviewers

Paste into **Notes to Mozilla reviewer**:

```
Image Reveal helps users find image URLs exposed via CSS backgrounds, transparent overlays, lazy attributes, or IIIF tiled viewers — not plain <img> tags.

PERMISSIONS (all user-initiated only; no background scanning):
• host_permissions <all_urls> — read computed styles/DOM and fetch IIIF info.json when the user invokes Reveal images here or the element picker
• contextMenus — "Reveal images here" menu item
• downloads — save when user clicks Download
• clipboardWrite — copy URL when user clicks Copy
• scripting — clipboard fallback on restrictive pages
• activeTab — user-gesture tab access

DATA: manifest declares data_collection_permissions required: ["none"]. No telemetry.

HOW TO TEST:
1. https://catalog.archives.gov/ — open any record with an image viewer, wait for tiles to load, right-click → Reveal images here. Look for "iiif full" in the panel.
2. Any site with a CSS background hero — reveal at the image area; background-image URL should appear.
3. Open/Download from the panel exercises host access only on user click.

Source: https://github.com/insylogo/background-reveal (TypeScript, readable; polyfill is standard Mozilla webextension-polyfill MPL-2.0).
```

---

## Screenshot captions (for AMO upload UI)

Use with PNGs from `store-assets/screenshots/`:

| File | Caption |
|------|---------|
| `01-nara-iiif-panel.png` | IIIF full-resolution URL revealed from National Archives Catalog tiled viewer |
| `02-element-picker.png` | Element picker — click any layer to reveal images at that point |
| `03-image-reveal.png` | CSS background-image URL found via right-click reveal |
| `04-open-all-buttons.png` | Accumulated results with Open all and Download all |

---

## Discoverability checklist

Terms intentionally woven into summary, description, and tags:

| User intent | Covered by |
|-------------|------------|
| save image greyed out / can't right click | Summary, description intro |
| CSS background image download | Tags, description, category Photos |
| IIIF / OpenSeadragon full resolution | Tags, description, reviewer test URL |
| museum / archive digitized collections | Tags, “Good fits” |
| lazy load data-src | Tags, bullet list |
| transparent overlay instagram-style | Summary, bullets |
| largest srcset | Bullets |
| download full res painting | Nationalmuseum / stitch mention |

After publish, monitor AMO search for: `iiif`, `background image`, `save image`, `css background` — adjust tags in a point release if needed.

---

## Manifest alignment (optional)

For consistency, the extension short description in `wxt.config.ts` can match the summary:

```
Find hidden image URLs — CSS backgrounds, overlays, lazy-load attrs, and IIIF tiled viewers. Open, copy, or download locally.
```

(147 characters — fits manifest `description` field.)
