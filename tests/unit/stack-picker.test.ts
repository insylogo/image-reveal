import { describe, expect, it, vi } from 'vitest';
import { getElementsAtPoint } from '../../src/lib/stack-picker';

describe('getElementsAtPoint', () => {
  it('includes media inside inert wrappers that hit-testing skips (X/Twitter)', () => {
    document.body.innerHTML =
      '<div inert><a id="link" href="#"><img id="pic" src="https://pbs.twimg.com/media/x?name=large"></a></div>';
    const link = document.getElementById('link')!;
    const pic = document.getElementById('pic')!;
    const rect = { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} };
    pic.getBoundingClientRect = () => rect as DOMRect;
    link.getBoundingClientRect = () => rect as DOMRect;
    (document as Document & { elementsFromPoint: unknown }).elementsFromPoint = vi.fn(() => [link]);
    (document as Document & { elementFromPoint: unknown }).elementFromPoint = vi.fn(() => link);

    expect(getElementsAtPoint(50, 50)).toContain(pic);
  });
});
