import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  outDir: '.output',
  zip: {
    artifactTemplate: 'image-reveal-{{version}}-{{browser}}.zip',
    sourcesTemplate: 'image-reveal-{{version}}-sources.zip',
    excludeSources: [
      '.output/**',
      'test-results/**',
      'web-ext-artifacts/**',
      'store-assets/screenshots/**',
    ],
  },
  manifest: ({ browser }) => ({
    name: 'Image Reveal',
    short_name: 'Image Reveal',
    description:
      'Find and save image URLs hidden in CSS backgrounds, overlays, lazy-load attributes, and tiled viewers.',
    version: '0.1.0',
    homepage_url: 'https://github.com/insylogo/background-reveal',
    permissions: ['contextMenus', 'scripting', 'downloads', 'clipboardWrite'],
    host_permissions: ['<all_urls>'],
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: '@image-reveal.insylogo',
              strict_min_version: '128.0',
              data_collection_permissions: {
                required: ['none'],
              },
            } as Record<string, unknown>,
          },
        }
      : {}),
    action: {
      default_title: 'Image Reveal',
      default_popup: 'popup.html',
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png',
      },
    },
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      96: 'icons/icon-96.png',
      128: 'icons/icon-128.png',
    },
  }),
});
