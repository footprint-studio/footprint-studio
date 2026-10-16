import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { reportHeight, sendHeight, HEIGHT_MESSAGE_TYPE } from '../src/height-reporter';

describe('height-reporter', () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;
  const originalParent = window.parent;

  beforeEach(() => {
    postMessageSpy = vi.fn();
    // jsdom 中 window.parent === window，替换 postMessage
    Object.defineProperty(window, 'parent', {
      configurable: true,
      get: () => ({ postMessage: postMessageSpy }),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'parent', {
      configurable: true,
      get: () => originalParent,
    });
  });

  it('sendHeight does nothing when height is 0', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 0 }) as DOMRect;
    sendHeight(el);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('sendHeight posts footprint:height message', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 480.4 }) as DOMRect;
    sendHeight(el);
    expect(postMessageSpy).toHaveBeenCalledWith({ type: HEIGHT_MESSAGE_TYPE, height: 481 }, '*');
  });

  it('reportHeight sends initial height', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 300 }) as DOMRect;
    const cleanup = reportHeight(el);
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('reportHeight returns cleanup function', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 300 }) as DOMRect;
    const cleanup = reportHeight(el);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('reportHeight re-sends on window load', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 250 }) as DOMRect;
    const cleanup = reportHeight(el);
    window.dispatchEvent(new Event('load'));
    expect(postMessageSpy).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('cleanup removes the load listener', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 250 }) as DOMRect;
    const cleanup = reportHeight(el);
    cleanup();
    window.dispatchEvent(new Event('load'));
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
  });

  it('reportHeight uses ResizeObserver when available', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 300 }) as DOMRect;

    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockRO {
      constructor(_cb: ResizeObserverCallback) {
        void _cb;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }
    const originalRO = globalThis.ResizeObserver;
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = MockRO;

    const cleanup = reportHeight(el);
    expect(observe).toHaveBeenCalledWith(el);

    cleanup();
    expect(disconnect).toHaveBeenCalled();

    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = originalRO;
  });

  it('reportHeight tolerates missing ResizeObserver', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 300 }) as DOMRect;

    const originalRO = globalThis.ResizeObserver;
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = undefined;

    const cleanup = reportHeight(el);
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(() => cleanup()).not.toThrow();

    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = originalRO;
  });

  it('sendHeight swallows postMessage errors', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ height: 300 }) as DOMRect;
    Object.defineProperty(window, 'parent', {
      configurable: true,
      get: () => ({
        postMessage: () => {
          throw new Error('blocked');
        },
      }),
    });
    expect(() => sendHeight(el)).not.toThrow();
  });
});
