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

    ctx.clearRect(0, 0, w, h);

    const padX = 60;
    const startX = padX;
    const endX = w - padX;
    const baseY = h - 60;
    const scaleY = h_turbina > 0 ? 150 / h_turbina : 1;
    const ocultaY = baseY + h_oculta * scaleY;

    // Line of sight
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    ctx.lineTo(endX, baseY);
    ctx.strokeStyle = "hsl(210, 80%, 63%)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "hsl(210, 80%, 63%)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Linha de Visão do Observador", startX + 15, baseY - 5);

    ctx.lineWidth = 4;

    // Visible turbine
    if (h_visivel > 0) {
      ctx.beginPath();
      ctx.moveTo(endX, baseY);
      ctx.lineTo(endX, baseY - h_visivel * scaleY);
      ctx.strokeStyle = "hsl(152, 82%, 42%)";
      ctx.stroke();

      // Nacelle
      ctx.beginPath();
      ctx.arc(endX, baseY - h_visivel * scaleY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(152, 82%, 42%)";
      ctx.fill();

      // Blades
      for (let b = 0; b < 3; b++) {
        const angle = (b * Math.PI * 2) / 3 + Date.now() * 0.0008;
        ctx.beginPath();
        ctx.moveTo(endX, baseY - h_visivel * scaleY);
        ctx.lineTo(
          endX + Math.cos(angle) * 20,
          baseY - h_visivel * scaleY + Math.sin(angle) * 20
        );
        ctx.strokeStyle = "hsla(152, 82%, 42%, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Hidden turbine
    if (h_oculta > 0) {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(endX, baseY);
      ctx.lineTo(endX, ocultaY);
      ctx.strokeStyle = "hsl(0, 72%, 63%)";
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Sea curve
    ctx.beginPath();
    ctx.moveTo(startX, baseY + 20);
    ctx.quadraticCurveTo((startX + endX) / 2, baseY - 5, endX, ocultaY);
    ctx.lineTo(endX, h);
    ctx.lineTo(startX, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, baseY, 0, h);
    grad.addColorStop(0, "hsla(240, 5%, 13%, 0.9)");
    grad.addColorStop(1, "hsl(240, 6%, 7%)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "hsl(240, 4%, 20%)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, baseY + 20);
    ctx.quadraticCurveTo((startX + endX) / 2, baseY - 5, endX, ocultaY);
    ctx.stroke();

    // Observer
    ctx.fillStyle = "hsl(240, 5%, 90%)";
    ctx.beginPath();
    ctx.arc(startX, baseY - 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(startX - 6, baseY - 3, 12, 18);

    ctx.textAlign = "center";
    ctx.fillStyle = "hsl(240, 4%, 55%)";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("Observador", startX, baseY + 40);
    ctx.fillText(`Distância: ${dist_km} km`, (startX + endX) / 2, h - 12);

    // Fog overlay when not visible due to atmosphere
    if (h_visivel > 0 && !isVisible) {
      ctx.fillStyle = "hsla(240, 6%, 7%, 0.7)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "hsl(0, 72%, 63%)";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ATENUADO PELA NÉVOA ATMOSFÉRICA", w / 2, h / 2);
    }
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
