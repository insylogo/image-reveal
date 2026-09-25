import { describe, expect, it } from 'vitest';
import {
  dziDescriptorFromTileUrl,
  dziLevelDimensions,
  dziMaxLevel,
  dziStitchLevel,
  dziTileUrl,
  imagesFromDzi,
  parseDziXml,
} from '../../src/lib/dzi';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<Image xmlns="http://schemas.microsoft.com/deepzoom/2008" Format="jpg" Overlap="2" TileSize="256">
  <Size Height="9221" Width="7026"/>
</Image>`;

const URL_ = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi';

describe('dzi', () => {
  it('parses a DZI descriptor', () => {
    const info = parseDziXml(XML, URL_);
    expect(info).toMatchObject({
      width: 7026,
      height: 9221,
      tileSize: 256,
      overlap: 2,
      format: 'jpg',
      tilesBase: 'https://openseadragon.github.io/example-images/duomo/duomo_files',
    });
  });

  it('derives the descriptor from a tile URL', () => {
    expect(
      dziDescriptorFromTileUrl(
        'https://openseadragon.github.io/example-images/duomo/duomo_files/8/0_0.jpg',
      ),
    ).toBe(URL_);
    expect(dziDescriptorFromTileUrl('https://x.test/a.jpg')).toBeNull();
  });

  it('computes levels and dimensions', () => {
    const info = parseDziXml(XML, URL_);
    expect(dziMaxLevel(info)).toBe(14);
    expect(dziLevelDimensions(info, 14)).toEqual({ width: 7026, height: 9221 });
    expect(dziLevelDimensions(info, 13)).toEqual({ width: 3513, height: 4611 });
    expect(dziStitchLevel(info)).toBe(14);
    expect(dziTileUrl(info, 14, 3, 5)).toBe(
      'https://openseadragon.github.io/example-images/duomo/duomo_files/14/3_5.jpg',
    );
  });

  it('drops to a lower level for images over the canvas limit', () => {
    expect(dziStitchLevel({ width: 40000, height: 30000 })).toBeLessThan(
      dziMaxLevel({ width: 40000, height: 30000 }),
    );
  });

  it('produces a stitchable result row with a preview tile', () => {
    const [img] = imagesFromDzi(parseDziXml(XML, URL_));
    expect(img?.kind).toBe('dzi');
    expect(img?.dziUrl).toBe(URL_);
    expect(img?.thumbUrl).toMatch(/duomo_files\/8\/0_0\.jpg$/);
  });
});
