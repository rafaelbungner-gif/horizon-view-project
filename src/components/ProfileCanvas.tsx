import { useEffect, useRef } from "react";

interface ProfileCanvasProps {
  dist_km: number;
  h_turbina: number;
  h_oculta: number;
  h_visivel: number;
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

const ProfileCanvas = ({ dist_km, h_turbina, h_oculta, h_visivel, isVisible, animate = false }: ProfileCanvasProps) => {
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
      const padX = 60;
      const startX = padX;
      const endX = w - padX;
      const drawW = endX - startX;
      const baseY = h - 70;
      const maxH = Math.max(h_turbina, h_oculta + 20, 50);
      const scaleY = (baseY - 60) / maxH;
      const curvatureDrop = h_oculta * scaleY;
      const seaStartY = baseY + 5;
      const seaEndY = baseY + curvatureDrop;
      const observerEyeY = baseY - 15;
      const turbineTopY = seaEndY - h_turbina * scaleY;
      const visibleTopY = observerEyeY - h_visivel * scaleY;
      const bladePhase = animate ? time * 0.0008 : -Math.PI / 2;

      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.moveTo(startX, seaStartY);
      ctx.quadraticCurveTo(startX + drawW * 0.6, baseY - Math.min(curvatureDrop * 0.15, 8), endX, seaEndY);
      ctx.lineTo(endX, h);
      ctx.lineTo(startX, h);
      ctx.closePath();
      const seaGrad = ctx.createLinearGradient(0, baseY, 0, h);
      seaGrad.addColorStop(0, "hsla(210, 40%, 18%, 0.95)");
      seaGrad.addColorStop(1, "hsl(210, 35%, 8%)");
      ctx.fillStyle = seaGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(startX, seaStartY);
      ctx.quadraticCurveTo(startX + drawW * 0.6, baseY - Math.min(curvatureDrop * 0.15, 8), endX, seaEndY);
      ctx.strokeStyle = "hsl(210, 30%, 28%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startX, observerEyeY);
      ctx.lineTo(endX, observerEyeY);
      ctx.strokeStyle = "hsl(210, 80%, 63%)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "hsl(210, 80%, 63%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Linha de Visão do Observador", startX + 20, observerEyeY - 6);

      if (h_oculta > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, seaEndY);
        ctx.lineTo(endX, Math.min(seaEndY, observerEyeY));
        ctx.strokeStyle = "hsl(0, 72%, 55%)";
        ctx.lineWidth = 4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "hsl(0, 72%, 60%)";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${h_oculta.toFixed(1)} m oculto`, endX - 10, (seaEndY + Math.min(seaEndY, observerEyeY)) / 2);
      }

      if (h_visivel > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, observerEyeY);
        ctx.lineTo(endX, visibleTopY);
        ctx.strokeStyle = "hsl(152, 82%, 42%)";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endX, visibleTopY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(152, 82%, 42%)";
        ctx.fill();

        for (let b = 0; b < 3; b++) {
          const angle = (b * Math.PI * 2) / 3 + bladePhase;
          ctx.beginPath();
          ctx.moveTo(endX, visibleTopY);
          ctx.lineTo(endX + Math.cos(angle) * 18, visibleTopY + Math.sin(angle) * 18);
          ctx.strokeStyle = "hsla(152, 82%, 42%, 0.7)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.fillStyle = "hsl(152, 82%, 50%)";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${h_visivel.toFixed(1)} m visível`, endX - 10, visibleTopY + 4);
      }

      if (h_turbina > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, seaEndY);
        ctx.lineTo(endX, turbineTopY);
        ctx.strokeStyle = "hsla(240, 5%, 50%, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = "hsl(240, 5%, 85%)";
      ctx.beginPath();
      ctx.arc(startX, baseY - 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(startX - 4, baseY - 10, 8, 15);

      ctx.textAlign = "center";
      ctx.fillStyle = "hsl(240, 4%, 50%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Observador", startX, h - 18);
      ctx.fillText(`${dist_km} km`, (startX + endX) / 2, h - 8);
      if (h_turbina > 0) ctx.fillText("Turbina", endX, h - 18);

      if (h_visivel > 0 && !isVisible) {
        ctx.fillStyle = "hsla(210, 20%, 10%, 0.75)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "hsl(0, 72%, 63%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ATENUADO PELA NÉVOA ATMOSFÉRICA", w / 2, h / 2);
      }

      if (h_visivel <= 0 && h_turbina > 0) {
        ctx.fillStyle = "hsl(0, 72%, 60%)";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TURBINA 100% OCULTA PELA CURVATURA", w / 2, 40);
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
  }, [dist_km, h_turbina, h_oculta, h_visivel, isVisible, animate]);

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center panel-glow">
      <span className="self-start text-xs font-bold tracking-[0.1em] text-muted-foreground mb-3 uppercase">
        Perfil Lateral (Curvatura da Terra)
      </span>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320 }} />
    </div>
  );
};

export default ProfileCanvas;
