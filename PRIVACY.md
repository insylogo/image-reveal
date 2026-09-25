# Privacy Policy: Image Reveal

**Effective date:** 2026-09-24
**Applies to:** Image Reveal browser extension (Firefox, Chrome, Edge), all versions

## The short version

Image Reveal does not collect, store, sell, share, or transmit any data about you. None. There are no accounts, no analytics, no telemetry, no crash reporting, no ads, and no servers operated by the developer. The developer never receives any information from the extension.

## What the extension does on your device

When **you** invoke it (right-click **Reveal images here**, or the toolbar **Start element picker**), the extension reads the page you are on, entirely inside your browser, to find image URLs: computed CSS styles, element attributes, and similar page structure. It never scans pages in the background or on its own.

Results are shown in a panel on the page and held only in memory. Closing the panel or the tab discards them. The extension does not write anything to extension storage, cookies, local storage, or disk, except files you explicitly choose to download.

## Network requests

The extension never contacts the developer or any service operated on the developer's behalf. The only network requests it makes go to the websites and image hosts you are already viewing:

- **IIIF image metadata:** on pages with tiled image viewers (for example, museum and archive sites), revealing may fetch the viewer's public `info.json` file from that same image server to work out the full-resolution image URL.
- **Open / Download:** when you click **Open**, **Download**, **Open all**, **Download all**, or **Stitch full res**, your browser requests those images from their host, the same way the page itself loads them. These requests may include your existing cookies for that site so that images which require your login still load.

These requests go to the site you are visiting, not to the developer. Those sites' own privacy policies govern what they log.

## Data collection declaration

- Personal information: **not collected**
- Browsing history or web activity: **not collected**
- Website content, image URLs, or page data: **not collected**
- Location, health, financial, authentication, or communications data: **not collected**
- Data sold or transferred to third parties: **never**

Firefox listing: the manifest declares `data_collection_permissions: { required: ["none"] }`.

## Permissions and why they exist

| Permission | Purpose |
|------------|---------|
| Access to all websites (`<all_urls>`) | Read the page you invoke the extension on, and fetch images/IIIF metadata from that page's hosts |
| `contextMenus` | Adds the **Reveal images here** right-click item |
| `downloads` | Saves an image when you click **Download** |
| `clipboardWrite` | Copies a URL when you click **Copy** |
| `scripting` | Clipboard fallback on pages that block the normal clipboard API |

## Children

The extension collects no data from anyone, including children.

## Changes

If this policy ever changes, the updated version will be published at this URL with a new effective date. Any change that introduced data collection would require your explicit opt-in first.

## Contact

Questions: open an issue at <https://github.com/insylogo/image-reveal/issues>.

Source code is public (MIT) at <https://github.com/insylogo/image-reveal>, so anyone can verify these statements.
