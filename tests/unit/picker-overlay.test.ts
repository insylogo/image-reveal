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

  it('Escape cancels without selecting', () => {
    const picker = new PickerOverlay();
    const onSelect = vi.fn();
    picker.start(onSelect);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(picker.isActive()).toBe(false);
  });
});
