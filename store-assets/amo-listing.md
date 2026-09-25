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

AMO's Description field supports only a limited set of Markdown: **bold**, *italic*, links, abbreviations, blockquotes, code, and lists. Headings and HTML are not supported, so section labels below use bold text. Paste everything inside the block:

```markdown
**Ever tried to save a picture and got a blank "Save image as", a blurry thumbnail, or nothing at all?** Image Reveal finds the real image behind what you see, even when the site hides it.

Many sites keep their images out of reach: set as page backgrounds, covered by invisible overlays, lazy-loaded, or split into hundreds of tiles inside a zoomable viewer. Image Reveal digs through all of that and hands you the actual file.

**How to use**

1. Right-click anywhere on a page and choose **Reveal images here**
2. Or click the toolbar icon, choose **Start element picker**, and click the picture you want (press **Esc** to cancel)
3. A panel lists every image found at that spot. **Open**, **Copy**, or **Download** any of them, or use **Open all** / **Download all**

Keep revealing and the list keeps growing until you close the panel.

**Full resolution from zoomable viewers**

Museum, archive, and library sites often show artwork in pan-and-zoom viewers made of small tiles. Image Reveal finds the full-size original, and **Stitch full res** downloads every tile and joins them into one high-resolution image, right in your browser. Works with:

- *IIIF* viewers such as the [National Archives Catalog](https://catalog.archives.gov/) and many museum collections
- *Deep Zoom* viewers built on [OpenSeadragon](https://openseadragon.github.io/)

**What it can find**

- CSS background images, including `image-set()`, masks, and `::before` / `::after` layers
- Pictures hidden under transparent overlays or unclickable wrappers
- The largest available version from `srcset` and `<picture>`
- Lazy-load attributes like `data-src` and `data-bg`
- Video posters, SVG images, blob and data URLs
- Content inside open shadow DOM

**Limitations**

- Does not bypass DRM, logins, or paywalls
- Images drawn directly onto a canvas with no file behind them can't be found
- Cross-origin iframes and closed shadow DOM are not supported
- On tiled viewers, let the image load before revealing

**Privacy**

> Image Reveal collects no data. None. No analytics, no accounts, no tracking, and nothing is ever sent to the developer. It only runs when you ask it to, and it only contacts the site you're already on.

[Privacy policy](https://github.com/insylogo/image-reveal/blob/main/PRIVACY.md) · [Source code (MIT)](https://github.com/insylogo/image-reveal) · [Report an issue](https://github.com/insylogo/image-reveal/issues)

*[IIIF]: International Image Interoperability Framework
*[DRM]: Digital Rights Management
```

---

## Homepage

```
https://github.com/insylogo/image-reveal
```

Or your project site if you add one later.

---

## Support / issues URL

```
https://github.com/insylogo/image-reveal/issues
```

---

## Privacy policy URL

**Required — must be a live HTTPS URL before submit.**

Options:

```
https://github.com/insylogo/image-reveal/blob/main/PRIVACY.md
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

Source: https://github.com/insylogo/image-reveal (TypeScript, readable; polyfill is standard Mozilla webextension-polyfill MPL-2.0).
```

---

## Screenshot captions (for AMO upload UI)

Use with PNGs from `store-assets/screenshots/`:

| File | Caption |
|------|---------|
| `01-nara-iiif.png` | Full-resolution image found behind the National Archives Catalog's zoomable viewer, ready to stitch |
| `02-openseadragon.png` | Deep Zoom image in an OpenSeadragon viewer. Stitch full res saves the complete 6960×5100 picture |
| `03-wikimedia-great-wave.png` | Right-click Reveal images here on any page to list every image at that spot |
| `04-open-all-download-all.png` | Reveal several images and collect them in one list, then Open all or Download all |

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
