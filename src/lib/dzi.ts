import type { ExtractedImage } from './types';
import { fetchImageInPageContext } from './page-image-fetch';

/** Deep Zoom Image (DZI) support: OpenSeadragon's native tile format. */

export interface DziInfo {
  url: string;
  tilesBase: string;
  width: number;
  height: number;
  tileSize: number;
  overlap: number;
  format: string;
}

const DZI_TILE_RE = /^(.+)_files\/(\d+)\/(\d+)_(\d+)\.(jpe?g|png|webp)(?:[?#].*)?$/i;
const DZI_DESCRIPTOR_RE = /\.(dzi|xml)(?:[?#].*)?$/i;
const DZI_IN_TEXT_RE = /["'`]([^"'`\s]+\.dzi)(?:\?[^"'`\s]*)?["'`]/gi;

const MAX_CANVAS_DIMENSION = 16384;
const MAX_PIXELS = 120_000_000;
const TILE_CONCURRENCY = 6;

export function dziDescriptorFromTileUrl(url: string): string | null {
  const match = url.match(DZI_TILE_RE);
  return match ? `${match[1]}.dzi` : null;
}

export function tilesBaseFromDescriptor(url: string): string {
  return `${url.split(/[?#]/)[0]!.replace(/\.(dzi|xml)$/i, '')}_files`;
}

export function detectDziDescriptors(base: string = document.baseURI): string[] {
  const found = new Set<string>();
  const add = (raw: string) => {
    try {
      found.add(new URL(raw, base).href.split('#')[0]!);
    } catch {
      // ignore
    }
  };

  try {
    for (const entry of performance.getEntriesByType('resource')) {
      const name = entry.name;
      if (/\.dzi(?:[?#]|$)/i.test(name)) add(name);
      else {
        const fromTile = dziDescriptorFromTileUrl(name);
        if (fromTile) add(fromTile);
      }
    }
  } catch {
    // ignore
  }

  for (const script of Array.from(document.querySelectorAll('script:not([src])'))) {
    for (const match of (script.textContent ?? '').matchAll(DZI_IN_TEXT_RE)) {
      if (match[1]) add(match[1]);
    }
  }

  // Prefer descriptors seen directly over ones inferred from tile paths.
  const byTiles = new Map<string, string>();
  for (const url of found) {
    const key = tilesBaseFromDescriptor(url);
    if (!byTiles.has(key) || DZI_DESCRIPTOR_RE.test(url)) byTiles.set(key, url);
  }
  return [...byTiles.values()];
}

export function parseDziXml(xml: string, url: string): DziInfo {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const image = doc.getElementsByTagName('Image')[0];
  const size = doc.getElementsByTagName('Size')[0];
  if (!image || !size) throw new Error('Not a DZI descriptor');
  const width = Number(size.getAttribute('Width'));
  const height = Number(size.getAttribute('Height'));
  if (!width || !height) throw new Error('DZI descriptor is missing dimensions');
  return {
    url,
    tilesBase: tilesBaseFromDescriptor(url),
    width,
    height,
    tileSize: Number(image.getAttribute('TileSize')) || 254,
    overlap: Number(image.getAttribute('Overlap')) || 0,
    format: image.getAttribute('Format') || 'jpg',
  };
}

export async function fetchDziInfo(url: string): Promise<DziInfo> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error(`DZI fetch failed: ${response.status}`);
  return parseDziXml(await response.text(), url);
}

export function dziMaxLevel(info: Pick<DziInfo, 'width' | 'height'>): number {
  return Math.ceil(Math.log2(Math.max(info.width, info.height)));
}

export function dziLevelDimensions(
  info: Pick<DziInfo, 'width' | 'height'>,
  level: number,
): { width: number; height: number } {
  const scale = 2 ** (dziMaxLevel(info) - level);
  return {
    width: Math.ceil(info.width / scale),
    height: Math.ceil(info.height / scale),
  };
}

/** Highest level whose dimensions fit within browser canvas limits. */
export function dziStitchLevel(info: Pick<DziInfo, 'width' | 'height'>): number {
  for (let level = dziMaxLevel(info); level >= 0; level--) {
    const { width, height } = dziLevelDimensions(info, level);
    if (
      width <= MAX_CANVAS_DIMENSION &&
      height <= MAX_CANVAS_DIMENSION &&
      width * height <= MAX_PIXELS
    ) {
      return level;
    }
  }
  return 0;
}

export function dziTileUrl(info: DziInfo, level: number, col: number, row: number): string {
  return `${info.tilesBase}/${level}/${col}_${row}.${info.format}`;
}

export function imagesFromDzi(info: DziInfo): ExtractedImage[] {
  const level = dziStitchLevel(info);
  const dims = dziLevelDimensions(info, level);
  const scaled = level !== dziMaxLevel(info);
  // Highest level that fits in a single tile makes a good preview.
  let thumbLevel = 0;
  for (let l = dziMaxLevel(info); l >= 0; l--) {
    const d = dziLevelDimensions(info, l);
    if (d.width <= info.tileSize && d.height <= info.tileSize) {
      thumbLevel = l;
      break;
    }
  }
  return [
    {
      url: info.url,
      kind: 'dzi',
      label: `Deep Zoom ${info.width}×${info.height}${
        scaled ? ` (stitches at ${dims.width}×${dims.height})` : ''
      }`,
      width: info.width,
      height: info.height,
      dziUrl: info.url,
      thumbUrl: dziTileUrl(info, thumbLevel, 0, 0),
    },
  ];
}

export async function resolveDziImages(): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];
  for (const url of detectDziDescriptors()) {
    try {
      images.push(...imagesFromDzi(await fetchDziInfo(url)));
    } catch {
      // not a usable DZI
    }
  }
  return images;
}

export async function stitchDziImage(
  info: DziInfo,
  onProgress?: (p: { completed: number; total: number }) => void,
): Promise<{ blob: Blob; width: number; height: number }> {
  const level = dziStitchLevel(info);
  const { width, height } = dziLevelDimensions(info, level);
  const cols = Math.ceil(width / info.tileSize);
  const rows = Math.ceil(height / info.tileSize);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) tiles.push({ col, row });
  }

  let completed = 0;
  let next = 0;
  onProgress?.({ completed, total: tiles.length });

  const worker = async () => {
    while (next < tiles.length) {
      const { col, row } = tiles[next++]!;
      const blob = await fetchImageInPageContext(dziTileUrl(info, level, col, row));
      const bitmap = await createImageBitmap(blob);
      try {
        // Tiles other than the first in each axis include `overlap` px on the leading edge.
        const x = col * info.tileSize - (col > 0 ? info.overlap : 0);
        const y = row * info.tileSize - (row > 0 ? info.overlap : 0);
        ctx.drawImage(bitmap, x, y);
      } finally {
        bitmap.close();
      }
      completed += 1;
      onProgress?.({ completed, total: tiles.length });
    }
  };
  await Promise.all(Array.from({ length: Math.min(TILE_CONCURRENCY, tiles.length) }, worker));

  const png = info.format.toLowerCase() === 'png';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode stitched image'))),
      png ? 'image/png' : 'image/jpeg',
      png ? undefined : 0.95,
    );
  });
  return { blob, width, height };
}

export async function downloadStitchedDziImage(
  url: string,
  onProgress?: (p: { completed: number; total: number }) => void,
): Promise<string> {
  const info = await fetchDziInfo(url);
  const { blob, width, height } = await stitchDziImage(info, onProgress);
  const slug = (url.split(/[?#]/)[0]!.split('/').pop() ?? 'deepzoom').replace(/\.(dzi|xml)$/i, '');
  const ext = info.format.toLowerCase() === 'png' ? 'png' : 'jpg';
  const filename = `${slug.slice(0, 40)}-${width}x${height}.${ext}`;
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  return filename;
}
