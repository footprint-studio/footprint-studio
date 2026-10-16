import { describe, it, expect } from 'vitest';
import { PopupManager } from '../../src/popup-manager';
import { createMockMaplibre } from '../mocks/maplibre';

describe('PopupManager', () => {
  it('open creates a popup', () => {
    const handle = createMockMaplibre();
    const pm = new PopupManager(handle.maplibre as never);
    const map = new handle.maplibre.Map({ container: document.createElement('div') });
    pm.open(map, [0, 0], 'hello');
    expect(handle.getPopups()).toHaveLength(1);
  });

  it('opening new popup closes previous (singleton)', () => {
    const handle = createMockMaplibre();
    const pm = new PopupManager(handle.maplibre as never);
    const map = new handle.maplibre.Map({ container: document.createElement('div') });
    pm.open(map, [0, 0], 'a');
    pm.open(map, [1, 1], 'b');
    expect(handle.getPopups()).toHaveLength(1);
    expect(handle.getPopups()[0]!.text).toBe('b');
  });

  it('close is idempotent', () => {
    const handle = createMockMaplibre();
    const pm = new PopupManager(handle.maplibre as never);
    const map = new handle.maplibre.Map({ container: document.createElement('div') });
    pm.open(map, [0, 0], 'a');
    pm.close();
    pm.close();
    expect(handle.getPopups()).toHaveLength(0);
  });

  it('destroy closes active popup', () => {
    const handle = createMockMaplibre();
    const pm = new PopupManager(handle.maplibre as never);
    const map = new handle.maplibre.Map({ container: document.createElement('div') });
    pm.open(map, [0, 0], 'a');
    pm.destroy();
    expect(handle.getPopups()).toHaveLength(0);
  });
});
