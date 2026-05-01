import { useEffect, useRef } from "react";

interface FOVCanvasProps {
  alpha: number;
  isVisible: boolean;
  animate?: boolean;
}

const setupCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
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
};

const FOVCanvas = ({ alpha, isVisible, animate = false }: FOVCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let frameId: number | null = null;
    let disposed = false;

    const draw = (time = 0) => {
      const { width: w, height: h } = setupCanvas(canvas, ctx);
      const cx = w / 2;
      const cy = h - 40;
      const radius = Math.max(20, cy - 50);
      const bladePhase = animate ? time * 0.001 : -Math.PI / 2;

      ctx.clearRect(0, 0, w, h);

      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius * i) / 3, Math.PI, 0);
        ctx.strokeStyle = "hsl(240 4% 20%)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 0);
      ctx.strokeStyle = "hsl(240 4% 25%)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "hsl(240 5% 90%)";
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 6, 0, Math.PI * 2);
      ctx.fill();

      if (alpha > 0 && isVisible) {
        const aRad = (alpha * Math.PI) / 180;
        const start = 1.5 * Math.PI - aRad / 2;
        const end = 1.5 * Math.PI + aRad / 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

        grad.addColorStop(0, "hsla(210, 80%, 63%, 0.3)");
        grad.addColorStop(1, "hsla(210, 80%, 63%, 0.05)");
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.strokeStyle = "hsl(210, 80%, 63%)";
        ctx.lineWidth = 2;
        ctx.stroke();

        const numTurbines = Math.min(Math.max(3, Math.floor(alpha / 2)), 12);
        for (let i = 0; i < numTurbines; i++) {
          const angle = start + ((end - start) * (i + 0.5)) / numTurbines;
          const tx = cx + Math.cos(angle) * (radius - 15);
          const ty = cy + Math.sin(angle) * (radius - 15);
          ctx.fillStyle = "hsl(210, 80%, 63%)";
          ctx.beginPath();
          ctx.arc(tx, ty, 3, 0, Math.PI * 2);
          ctx.fill();

          for (let b = 0; b < 3; b++) {
            const bladeAngle = (b * Math.PI * 2) / 3 + bladePhase;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + Math.cos(bladeAngle) * 8, ty + Math.sin(bladeAngle) * 8);
            ctx.strokeStyle = "hsla(210, 80%, 63%, 0.6)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        ctx.fillStyle = "hsl(240 5% 13%)";
        ctx.strokeStyle = "hsl(210, 80%, 63%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - 85, cy - radius - 32, 170, 24, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "hsl(240 5% 90%)";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`LARGURA ANGULAR: ${alpha.toFixed(1)}°`, cx, cy - radius - 16);
      } else if (!isVisible) {
        ctx.fillStyle = "hsl(0 72% 63%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("INVISÍVEL", cx, cy - radius / 2 - 8);
        ctx.font = "11px Inter, sans-serif";
        ctx.fillStyle = "hsl(240 4% 55%)";
        ctx.fillText("Oculto pelo horizonte ou atenuado pela névoa", cx, cy - radius / 2 + 10);
      }

      if (animate && !disposed) {
        frameId = requestAnimationFrame(draw);
      }
    };

    const render = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(draw);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(render);
    resizeObserver?.observe(canvas);
    render();

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [alpha, isVisible, animate]);

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center panel-glow">
      <span className="self-start text-xs font-bold tracking-[0.1em] text-muted-foreground mb-3 uppercase">
        Campo de Visão Periférico (180°)
      </span>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320 }} />
    </div>
  );
};

export default FOVCanvas;
