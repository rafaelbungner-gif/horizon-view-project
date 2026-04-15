import { useRef, useEffect } from "react";

interface FOVCanvasProps {
  alpha: number;
  isVisible: boolean;
}

const FOVCanvas = ({ alpha, isVisible }: FOVCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    const cx = w / 2;
    const cy = h - 40;
    const radius = cy - 50;

    ctx.clearRect(0, 0, w, h);

    // Grid arcs
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius * i) / 3, Math.PI, 0);
      ctx.strokeStyle = "hsl(240 4% 20%)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Horizon arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0);
    ctx.strokeStyle = "hsl(240 4% 25%)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Observer
    ctx.fillStyle = "hsl(240 5% 90%)";
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    if (alpha > 0 && isVisible) {
      const aRad = (alpha * Math.PI) / 180;
      const start = 1.5 * Math.PI - aRad / 2;
      const end = 1.5 * Math.PI + aRad / 2;

      // Cone fill
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, "hsla(210, 80%, 63%, 0.3)");
      grad.addColorStop(1, "hsla(210, 80%, 63%, 0.05)");
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Cone border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.strokeStyle = "hsl(210, 80%, 63%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Turbine icons along arc
      const numTurbines = Math.min(Math.max(3, Math.floor(alpha / 2)), 12);
      for (let i = 0; i < numTurbines; i++) {
        const angle = start + ((end - start) * (i + 0.5)) / numTurbines;
        const tx = cx + Math.cos(angle) * (radius - 15);
        const ty = cy + Math.sin(angle) * (radius - 15);
        ctx.fillStyle = "hsl(210, 80%, 63%)";
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
        // Blade lines
        for (let b = 0; b < 3; b++) {
          const ba = (b * Math.PI * 2) / 3 + Date.now() * 0.001;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(ba) * 8, ty + Math.sin(ba) * 8);
          ctx.strokeStyle = "hsla(210, 80%, 63%, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Label
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
  }, [alpha, isVisible]);

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
