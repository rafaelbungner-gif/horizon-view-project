import { useRef, useEffect } from "react";

interface ProfileCanvasProps {
  dist_km: number;
  h_turbina: number;
  h_oculta: number;
  h_visivel: number;
  isVisible: boolean;
}

const ProfileCanvas = ({ dist_km, h_turbina, h_oculta, h_visivel, isVisible }: ProfileCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const padX = 60;
      const startX = padX;
      const endX = w - padX;
      const drawW = endX - startX;
      const baseY = h - 70;

      // Dynamic scale: use max of h_turbina and h_oculta so hidden portion is always visible
      const maxH = Math.max(h_turbina, h_oculta + 20, 50);
      const availH = baseY - 60; // pixels available for height
      const scaleY = availH / maxH;

      // Earth curvature - the "drop" increases quadratically with distance
      // We simulate this by drawing the sea surface as a curve that drops at the far end
      const curvatureDrop = h_oculta * scaleY;

      // Sea surface curve
      const seaStartY = baseY + 5;
      const seaEndY = baseY + curvatureDrop;

      // Draw sea fill
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

      // Sea surface line
      ctx.beginPath();
      ctx.moveTo(startX, seaStartY);
      ctx.quadraticCurveTo(startX + drawW * 0.6, baseY - Math.min(curvatureDrop * 0.15, 8), endX, seaEndY);
      ctx.strokeStyle = "hsl(210, 30%, 28%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Line of sight (from observer eye to horizon)
      const observerEyeY = baseY - 15;
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

      // Turbine at the far end
      const turbineBaseY = seaEndY; // turbine sits on sea surface at far end
      const turbineTopY = turbineBaseY - h_turbina * scaleY;
      const visibleTopY = turbineBaseY - h_visivel * scaleY;

      // Hidden portion (below line of sight, dashed red)
      if (h_oculta > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, turbineBaseY);
        ctx.lineTo(endX, Math.min(turbineBaseY, observerEyeY));
        ctx.strokeStyle = "hsl(0, 72%, 55%)";
        ctx.lineWidth = 4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label for hidden
        const hiddenMidY = (turbineBaseY + Math.min(turbineBaseY, observerEyeY)) / 2;
        ctx.fillStyle = "hsl(0, 72%, 60%)";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${h_oculta.toFixed(1)}m oculto`, endX - 10, hiddenMidY);
      }

      // Visible portion (above line of sight, solid green)
      if (h_visivel > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, observerEyeY);
        ctx.lineTo(endX, observerEyeY - h_visivel * scaleY);
        ctx.strokeStyle = "hsl(152, 82%, 42%)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Nacelle
        const nacelleY = observerEyeY - h_visivel * scaleY;
        ctx.beginPath();
        ctx.arc(endX, nacelleY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(152, 82%, 42%)";
        ctx.fill();

        // Blades
        for (let b = 0; b < 3; b++) {
          const angle = (b * Math.PI * 2) / 3 + Date.now() * 0.0008;
          ctx.beginPath();
          ctx.moveTo(endX, nacelleY);
          ctx.lineTo(endX + Math.cos(angle) * 18, nacelleY + Math.sin(angle) * 18);
          ctx.strokeStyle = "hsla(152, 82%, 42%, 0.7)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label for visible
        ctx.fillStyle = "hsl(152, 82%, 50%)";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${h_visivel.toFixed(1)}m visível`, endX - 10, nacelleY + 4);
      }

      // Full turbine ghost outline (faint)
      if (h_turbina > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, turbineBaseY);
        ctx.lineTo(endX, turbineTopY);
        ctx.strokeStyle = "hsla(240, 5%, 50%, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Observer figure
      ctx.fillStyle = "hsl(240, 5%, 85%)";
      ctx.beginPath();
      ctx.arc(startX, baseY - 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(startX - 4, baseY - 10, 8, 15);

      // Labels
      ctx.textAlign = "center";
      ctx.fillStyle = "hsl(240, 4%, 50%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Observador", startX, h - 18);
      ctx.fillText(`${dist_km} km`, (startX + endX) / 2, h - 8);

      if (h_turbina > 0) {
        ctx.fillText("Turbina", endX, h - 18);
      }

      // Fog overlay when not visible due to atmosphere (but turbine clears horizon)
      if (h_visivel > 0 && !isVisible) {
        ctx.fillStyle = "hsla(210, 20%, 10%, 0.75)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "hsl(0, 72%, 63%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ATENUADO PELA NÉVOA ATMOSFÉRICA", w / 2, h / 2);
      }

      // Fully hidden message
      if (h_visivel <= 0 && h_turbina > 0) {
        ctx.fillStyle = "hsl(0, 72%, 60%)";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TURBINA 100% OCULTA PELA CURVATURA", w / 2, 40);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dist_km, h_turbina, h_oculta, h_visivel, isVisible]);

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
