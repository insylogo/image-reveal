import { describe, expect, it, vi } from 'vitest';
import { PickerOverlay } from '../../src/ui/picker-overlay';

describe('PickerOverlay', () => {
  it('calls the select handler with the click point and removes itself', () => {
    const picker = new PickerOverlay();
    const onSelect = vi.fn();
    picker.start(onSelect);
    expect(document.querySelector('[data-image-reveal="picker"]')).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 25 }));

    expect(onSelect).toHaveBeenCalledWith(40, 25);
    expect(picker.isActive()).toBe(false);
    expect(document.querySelector('[data-image-reveal="picker"]')).toBeNull();
  });

  it('positions the highlight in viewport coordinates even when the page is scrolled', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    target.getBoundingClientRect = () =>
      ({ top: 100, left: 50, width: 200, height: 80, right: 250, bottom: 180, x: 50, y: 100 }) as DOMRect;
    const origElementsFromPoint = document.elementsFromPoint;
    document.elementsFromPoint = () => [target];
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 30, configurable: true });

    const picker = new PickerOverlay();
    picker.start(vi.fn());
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 110 }));

    const root = document.querySelector<HTMLElement>('[data-image-reveal="picker"]')!;
    const highlight = root.children[0] as HTMLElement;
    expect(highlight.style.top).toBe('100px');
    expect(highlight.style.left).toBe('50px');
    expect(highlight.style.width).toBe('200px');

    picker.stop();
    target.remove();
    document.elementsFromPoint = origElementsFromPoint;
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
  });

  it('Escape cancels without selecting', () => {
    const picker = new PickerOverlay();
    const onSelect = vi.fn();
    picker.start(onSelect);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(picker.isActive()).toBe(false);
  });
});
