/**
 * 回归测试 · MapLibre v5 兼容性（fog）
 * v5 移除了 setFog（大气效果改由 setSky 承担）。
 * applyFog 必须能力探测：setFog → setSky → 静默跳过，且不得抛错阻断初始化。
 */

import { describe, expect, it, vi } from 'vitest';
import type * as maplibregl from 'maplibre-gl';
import { MapController } from '../../src/map-controller';
import { DEFAULT_FOG } from '../../src/config/defaults';

type FogPayload = Record<string, unknown>;
type MaplibreModule = typeof maplibregl;

/** 构造一个最小可用的 maplibre 模块 stub，Map 实例由 mapFactory 决定 */
function makeMaplibre(mapFactory: (opts: Record<string, unknown>) => unknown): MaplibreModule {
  const selfRef = (): unknown => selfRef;
  const markerFactory = () => ({
    setLngLat: selfRef,
    addTo: selfRef,
    remove: selfRef,
  });
  const popupFactory = () => ({
    setText: selfRef,
    setLngLat: selfRef,
    addTo: selfRef,
    remove: selfRef,
  });
  // Map 必须可 new：包装为构造函数，内部返回 mapFactory 产物
  const StubMap = function (this: unknown, opts: Record<string, unknown>) {
    return mapFactory(opts);
  } as unknown as new (opts: Record<string, unknown>) => unknown;
  return {
    Map: StubMap,
    Marker: markerFactory,
    Popup: popupFactory,
  } as unknown as MaplibreModule;
}

/** style.load 同步触发的 Map stub（对齐 mock 行为） */
function styleLoadEmitter(opts: Record<string, unknown>, extra: Record<string, unknown>) {
  return {
    ...opts,
    on: (ev: string, cb: () => void) => {
      if (ev === 'style.load') cb();
    },
    setProjection: vi.fn(),
    remove: vi.fn(),
    ...extra,
  };
}

describe('MapController · fog 兼容性（MapLibre v5 回归）', () => {
  function setup(mapFactory: (opts: Record<string, unknown>) => unknown) {
    const maplibre = makeMaplibre(mapFactory);
    const controller = new MapController(document.createElement('div'), maplibre, {});
    controller.init();
    return controller;
  }

  it('Map 只有 setSky（v5）时降级调用 setSky，不抛错', () => {
    const calls: { sky?: FogPayload } = {};
    const controller = setup((opts) =>
      styleLoadEmitter(opts, {
        setSky: (o: unknown) => {
          calls.sky = o as FogPayload;
        },
      }),
    );
    controller.applyFog(DEFAULT_FOG);
    expect(calls.sky).toBeTruthy();
    // sky 属性名：horizon-blend 映射为 horizon-fog-blend
    expect(calls.sky?.['horizon-fog-blend']).toBe(0);
    expect(calls.sky?.['horizon-blend']).toBeUndefined();
  });

  it('Map 既无 setFog 也无 setSky 时静默跳过，不抛错', () => {
    const controller = setup((opts) => styleLoadEmitter(opts, {}));
    expect(() => controller.applyFog(DEFAULT_FOG)).not.toThrow();
  });

  it('Map 有 setFog（v4 兼容路径）时优先调用 setFog', () => {
    const calls: { fog?: FogPayload } = {};
    const controller = setup((opts) =>
      styleLoadEmitter(opts, {
        setFog: (o: unknown) => {
          calls.fog = o as FogPayload;
        },
      }),
    );
    controller.applyFog(DEFAULT_FOG);
    expect(calls.fog).toBeTruthy();
  });

  it('fog 抛错时不阻断地图初始化（吞异常）', () => {
    const controller = setup((opts) =>
      styleLoadEmitter(opts, {
        setFog: () => {
          throw new Error('boom');
        },
      }),
    );
    expect(() => controller.applyFog(DEFAULT_FOG)).not.toThrow();
  });

  it('style.load 自动触发时（v5 真实时序）也不因 fog 抛错中断', () => {
    // style.load 回调内调用 applyFog——即线上报错的路径
    const controller = setup((opts) =>
      styleLoadEmitter(opts, {
        // v5：无 setFog，setSky 存在
        setSky: vi.fn(),
      }),
    );
    expect(controller.getMap()).toBeTruthy();
  });
});
