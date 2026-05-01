import { useCallback, useRef } from "react";
import { clamp, useCanvasRenderer } from "@/hooks/useCanvasRenderer";

interface FOVCanvasProps {
  alpha: number;
  isVisible: boolean;
  atmosphericTransmission?: number;
  animate?: boolean;
}

const FOVCanvas = ({ alpha, isVisible, atmosphericTransmission = 1, animate = false }: FOVCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D, { width: w, height: h }: { width: number; height: number }, time: number) => {
    const cx = w / 2;
    const cy = h - 40;
    const radius = Math.max(20, cy - 50);
    const bladePhase = animate ? time * 0.001 : -Math.PI / 2;
    const transmission = clamp(atmosphericTransmission, 0, 1);
    const turbineOpacity = clamp(0.18 + transmission * 0.82, 0.18, 1);
    const fogOpacity = clamp(1 - transmission, 0, 0.82);

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

    if (alpha > 0) {
      const aRad = (alpha * Math.PI) / 180;
      const start = 1.5 * Math.PI - aRad / 2;
      const end = 1.5 * Math.PI + aRad / 2;
      const color = isVisible ? "210, 80%, 63%" : "240, 5%, 60%";
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

      grad.addColorStop(0, `hsla(${color}, ${isVisible ? 0.28 : 0.12})`);
      grad.addColorStop(1, `hsla(${color}, 0.04)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${color}, ${isVisible ? 0.95 : 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      const numTurbines = Math.min(Math.max(3, Math.floor(Math.max(alpha, 1) / 2)), 12);
      for (let i = 0; i < numTurbines; i++) {
        const angle = start + ((end - start) * (i + 0.5)) / numTurbines;
        const tx = cx + Math.cos(angle) * (radius - 15);
        const ty = cy + Math.sin(angle) * (radius - 15);
        ctx.save();
        ctx.globalAlpha = isVisible ? turbineOpacity : 0.25;
        ctx.fillStyle = `hsl(${color})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();

        for (let b = 0; b < 3; b++) {
          const bladeAngle = (b * Math.PI * 2) / 3 + bladePhase;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(bladeAngle) * 8, ty + Math.sin(bladeAngle) * 8);
          ctx.strokeStyle = `hsla(${color}, 0.72)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fogOpacity > 0.02) {
        ctx.fillStyle = `hsla(205, 35%, 82%, ${fogOpacity * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "hsl(240 5% 13%)";
      ctx.strokeStyle = isVisible ? "hsl(210, 80%, 63%)" : "hsl(0, 72%, 63%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx - 100, cy - radius - 34, 200, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "hsl(240 5% 90%)";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`α ${alpha.toFixed(1)}° · transmissão ${(transmission * 100).toFixed(0)}%`, cx, cy - radius - 16);
    }

    if (!isVisible) {
      ctx.fillStyle = "hsl(0 72% 63%)";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NÃO DETECTÁVEL", cx, cy - radius / 2 - 8);
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = "hsl(240 4% 65%)";
      ctx.fillText("Oculto pelo horizonte ou atenuado pela névoa", cx, cy - radius / 2 + 10);
    }
  }, [alpha, atmosphericTransmission, animate, isVisible]);

  useCanvasRenderer(canvasRef, draw, animate);

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
