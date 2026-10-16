/**
 * 足迹地球 · iframe 高度上报
 * 契约依据：《Sprint 2 执行方案》§4.4、§7 S2-8
 *
 * iframe → parent 消息格式：
 *   { type: 'footprint:height', height: number }
 */

export interface HeightMessage {
  type: 'footprint:height';
  height: number;
}

export const HEIGHT_MESSAGE_TYPE = 'footprint:height';

/** 上报一次高度 */
export function sendHeight(container: HTMLElement): void {
  const height = Math.ceil(container.getBoundingClientRect().height);
  if (height <= 0) return;
  const msg: HeightMessage = { type: HEIGHT_MESSAGE_TYPE, height };
  try {
    window.parent?.postMessage(msg, '*');
  } catch {
    /* noop: 跨域或环境不支持 */
  }
}

/** 监听容器高度变化并持续上报 */
export function reportHeight(container: HTMLElement): () => void {
  sendHeight(container);

  let observer: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => sendHeight(container));
    observer.observe(container);
  }

  const onLoad = () => sendHeight(container);
  window.addEventListener('load', onLoad, { once: true });

  return () => {
    observer?.disconnect();
    window.removeEventListener('load', onLoad);
  };
}
