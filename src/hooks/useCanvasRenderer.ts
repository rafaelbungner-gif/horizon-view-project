import { type RefObject, useEffect } from "react";

export interface CanvasSize {
  width: number;
  height: number;
}

export type CanvasDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize, time: number) => void;

export function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CanvasSize {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const nextWidth = Math.round(width * dpr);
  const nextHeight = Math.round(height * dpr);

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useCanvasRenderer(
  canvasRef: RefObject<HTMLCanvasElement>,
  draw: CanvasDraw,
  animate = false,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let frameId: number | null = null;
    let disposed = false;

    const drawFrame = (time: number) => {
      frameId = null;
      if (disposed) return;

      const size = setupCanvas(canvas, ctx);
      draw(ctx, size, time);

      if (animate && !disposed) {
        frameId = requestAnimationFrame(drawFrame);
      }
    };

    const scheduleDraw = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(drawFrame);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleDraw);
    resizeObserver?.observe(canvas);
    scheduleDraw();

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [canvasRef, draw, animate]);
}
