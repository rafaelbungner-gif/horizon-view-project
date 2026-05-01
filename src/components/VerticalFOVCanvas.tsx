import { useEffect, useRef } from "react";

interface VerticalFOVCanvasProps {
  theta: number;
  alpha: number;
  largura_km: number;
  h_visivel: number;
  h_oculta: number;
  h_turbina: number;
  dist_km: number;
  isVisible: boolean;
  animate?: boolean;
}

const FOV_VERTICAL = 60;
const FOV_HORIZONTAL = 60;
const TURBINE_SPACING_KM = 1.2;

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

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const VerticalFOVCanvas = ({
  theta,
  alpha,
  largura_km,
  h_visivel,
  h_oculta,
  h_turbina,
  dist_km,
  isVisible,
  animate = false,
}: VerticalFOVCanvasProps) => {
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
      const marginL = 56;
      const marginR = 24;
      const marginT = 52;
      const marginB = 52;
      const viewW = w - marginL - marginR;
      const viewH = h - marginT - marginB;
      const horizonY = marginT + viewH / 2;
      const pxPerDegV = viewH / FOV_VERTICAL;
      const pxPerDegH = viewW / FOV_HORIZONTAL;
      const centerX = marginL + viewW / 2;
      const thetaPx = theta * pxPerDegV;
      const drawnThetaPx = theta > 0 ? Math.max(thetaPx, 8) : 0;
      const alphaPxFull = alpha * pxPerDegH;
      const parkLeft = Math.max(centerX - alphaPxFull / 2, marginL);
      const parkRight = Math.min(centerX + alphaPxFull / 2, marginL + viewW);
      const overflowsFOV = alpha > FOV_HORIZONTAL;
      const distM = Math.max(dist_km * 1000, 1);
      const hiddenDeg = (Math.atan(h_oculta / distM) * 180) / Math.PI;
      const hiddenPx = Math.min(hiddenDeg * pxPerDegV, viewH / 2 - 4);
      const bladePhase = animate ? time * 0.0015 : -Math.PI / 2;

      ctx.clearRect(0, 0, w, h);

      const skyGrad = ctx.createLinearGradient(0, marginT, 0, horizonY);
      skyGrad.addColorStop(0, "hsl(215 50% 12%)");
      skyGrad.addColorStop(1, "hsl(210 60% 28%)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(marginL, marginT, viewW, viewH / 2);

      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, marginT + viewH);
      seaGrad.addColorStop(0, "hsl(215 65% 18%)");
      seaGrad.addColorStop(1, "hsl(220 55% 8%)");
      ctx.fillStyle = seaGrad;
      ctx.fillRect(marginL, horizonY, viewW, viewH / 2);

      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let deg = -30; deg <= 30; deg += 5) {
        const y = horizonY - deg * pxPerDegV;
        ctx.beginPath();
        ctx.moveTo(marginL - 4, y);
        ctx.lineTo(marginL, y);
        ctx.strokeStyle = deg === 0 ? "hsl(240 5% 70%)" : "hsl(240 4% 30%)";
        ctx.lineWidth = deg === 0 ? 1.5 : 1;
        ctx.stroke();
        if (deg % 10 === 0) {
          ctx.fillStyle = deg === 0 ? "hsl(240 5% 80%)" : "hsl(240 4% 55%)";
          ctx.fillText(`${deg > 0 ? "+" : ""}${deg}°`, marginL - 8, y);
        }
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      for (let deg = -30; deg <= 30; deg += 5) {
        const x = centerX + deg * pxPerDegH;
        ctx.beginPath();
        ctx.moveTo(x, marginT - 4);
        ctx.lineTo(x, marginT);
        ctx.strokeStyle = deg === 0 ? "hsl(240 5% 70%)" : "hsl(240 4% 30%)";
        ctx.lineWidth = deg === 0 ? 1.5 : 1;
        ctx.stroke();
        if (deg % 10 === 0) {
          ctx.fillStyle = deg === 0 ? "hsl(240 5% 80%)" : "hsl(240 4% 55%)";
          ctx.fillText(`${deg > 0 ? "+" : ""}${deg}°`, x, marginT - 6);
        }
      }

      ctx.beginPath();
      ctx.moveTo(marginL, horizonY);
      ctx.lineTo(marginL + viewW, horizonY);
      ctx.strokeStyle = "hsl(240 5% 70%)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "hsl(240 5% 70%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("HORIZONTE", marginL + 6, horizonY - 4);

      ctx.strokeStyle = "hsl(240 4% 25%)";
      ctx.lineWidth = 1;
      ctx.strokeRect(marginL, marginT, viewW, viewH);

      ctx.fillStyle = isVisible ? "hsla(142, 71%, 60%, 0.10)" : "hsla(240, 5%, 60%, 0.10)";
      ctx.fillRect(parkLeft, horizonY - Math.max(drawnThetaPx, 12) - 6, Math.max(0, parkRight - parkLeft), Math.max(drawnThetaPx, 12) + 6);

      const drawTurbine = (x: number, baseY: number, topY: number, hidden = false, opacity = 1) => {
        const towerH = baseY - topY;
        if (towerH <= 0) return;

        ctx.save();
        ctx.globalAlpha = opacity;
        const towerWBase = Math.max(2, towerH * 0.06);
        const towerWTop = Math.max(1.5, towerH * 0.03);
        ctx.beginPath();
        ctx.moveTo(x - towerWBase / 2, baseY);
        ctx.lineTo(x - towerWTop / 2, topY);
        ctx.lineTo(x + towerWTop / 2, topY);
        ctx.lineTo(x + towerWBase / 2, baseY);
        ctx.closePath();

        if (hidden) {
          ctx.strokeStyle = "hsl(0 72% 63%)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          return;
        }

        ctx.fillStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 60%)";
        ctx.fill();

        const nacelleR = Math.max(2, towerH * 0.05);
        ctx.beginPath();
        ctx.arc(x, topY, nacelleR, 0, Math.PI * 2);
        ctx.fill();

        const bladeLen = Math.max(8, towerH * 0.4);
        ctx.strokeStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 60%)";
        ctx.lineWidth = Math.max(1.2, towerH * 0.02);
        ctx.lineCap = "round";
        for (let b = 0; b < 3; b++) {
          const angle = bladePhase + x * 0.01 + (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x + Math.cos(angle) * bladeLen, topY + Math.sin(angle) * bladeLen);
          ctx.stroke();
        }
        ctx.restore();
      };

      if (h_visivel > 0 && theta > 0) {
        const turbineCount = Math.max(2, Math.min(15, Math.round(largura_km / TURBINE_SPACING_KM)));
        const alphaPxForSpacing = alpha > 0 ? alpha * pxPerDegH : viewW;
        const spacingPx = alphaPxForSpacing / Math.max(turbineCount - 1, 1);
        const maxTowerH = Math.max(8, spacingPx * 0.8);
        const towerH = Math.min(Math.max(drawnThetaPx, 8), maxTowerH);

        for (let i = 0; i < turbineCount; i++) {
          const t = turbineCount === 1 ? 0.5 : i / (turbineCount - 1);
          const deg = -alpha / 2 + t * alpha;
          const x = centerX + deg * pxPerDegH;
          if (x < marginL - 24 || x > marginL + viewW + 24) continue;

          const distanceFromCenter = Math.abs(x - centerX) / Math.max(viewW / 2, 1);
          const opacity = 1 - Math.min(distanceFromCenter * 0.4, 0.4);
          drawTurbine(x, horizonY, horizonY - towerH, false, opacity);

          if (h_oculta > 0 && hiddenPx > 1) {
            drawTurbine(x, horizonY + hiddenPx, horizonY, true, opacity);
          }
        }

        const alphaY = horizonY + Math.max(hiddenPx, 0) + 18;
        const aLeft = Math.max(parkLeft, marginL + 2);
        const aRight = Math.min(parkRight, marginL + viewW - 2);
        ctx.strokeStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(240 5% 60%)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(aLeft, alphaY);
        ctx.lineTo(aRight, alphaY);
        ctx.stroke();

        if (overflowsFOV) {
          ctx.fillStyle = "hsl(0 72% 63%)";
          ctx.font = "9px Inter, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText("◀ continua", marginL + 4, alphaY);
          ctx.textAlign = "right";
          ctx.fillText("continua ▶", marginL + viewW - 4, alphaY);
        }
      }

      const legendX = marginL + 12;
      const legendTop = marginT + 12;
      const legendW = 230;
      const legendH = 84;
      ctx.fillStyle = "hsla(215, 50%, 12%, 0.84)";
      drawRoundedRect(ctx, legendX, legendTop, legendW, legendH, 8);
      ctx.fill();
      ctx.strokeStyle = isVisible ? "hsla(142, 71%, 60%, 0.45)" : "hsla(0, 72%, 63%, 0.45)";
      ctx.stroke();

      ctx.fillStyle = isVisible ? "hsl(142 71% 80%)" : "hsl(0 72% 70%)";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(isVisible ? "Turbinas detectáveis" : h_visivel > 0 ? "Bloqueio atmosférico" : "Ocultas pelo horizonte", legendX + 10, legendTop + 9);
      ctx.font = "10px Inter, sans-serif";
      ctx.fillStyle = "hsl(240 4% 70%)";
      ctx.fillText(`θ = ${theta.toFixed(3)}° · α = ${alpha.toFixed(2)}°`, legendX + 10, legendTop + 30);
      ctx.fillText(`Visível: ${h_visivel.toFixed(1)} m de ${h_turbina.toFixed(1)} m`, legendX + 10, legendTop + 47);
      ctx.fillText(`Largura: ${largura_km.toFixed(1)} km · Distância: ${dist_km.toFixed(1)} km`, legendX + 10, legendTop + 64);

      if (h_visivel <= 0) {
        ctx.fillStyle = "hsl(0 72% 63%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("TURBINAS 100% OCULTAS PELO HORIZONTE", centerX, horizonY - 20);
      } else if (!isVisible) {
        ctx.fillStyle = "hsla(240, 5%, 70%, 0.55)";
        ctx.fillRect(marginL, marginT, viewW, viewH);
        ctx.fillStyle = "hsl(0 72% 50%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ATENUADO PELA NÉVOA", centerX, horizonY - 20);
      }

      const barY = marginT + viewH + 22;
      const barH = 6;
      const halfW = (viewW - 16) / 2;
      ctx.fillStyle = "hsl(240 4% 18%)";
      ctx.fillRect(marginL, barY, halfW, barH);
      ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
      ctx.fillRect(marginL, barY, Math.max(Math.min(theta / FOV_VERTICAL, 1) * halfW, theta > 0 ? 2 : 0), barH);
      ctx.fillStyle = "hsl(240 4% 65%)";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`Vertical θ: ${((theta / FOV_VERTICAL) * 100).toFixed(4)}% do FOV`, marginL, barY + barH + 3);

      const barX2 = marginL + halfW + 16;
      ctx.fillStyle = "hsl(240 4% 18%)";
      ctx.fillRect(barX2, barY, halfW, barH);
      ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
      ctx.fillRect(barX2, barY, Math.max(Math.min(alpha / FOV_HORIZONTAL, 1) * halfW, alpha > 0 ? 2 : 0), barH);
      ctx.fillStyle = "hsl(240 4% 65%)";
      ctx.fillText(`Horizontal α: ${((alpha / FOV_HORIZONTAL) * 100).toFixed(2)}% do FOV${overflowsFOV ? " (excede)" : ""}`, barX2, barY + barH + 3);

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
  }, [theta, alpha, largura_km, h_visivel, h_oculta, h_turbina, dist_km, isVisible, animate]);

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col panel-glow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
        <span className="text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
          Simulação POV — Impacto Vertical (θ) + Largura do Parque (α)
        </span>
        <span className="text-[10px] text-muted-foreground">
          Render sob demanda · FOV 60° × 60°
        </span>
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400 }} />
    </div>
  );
};

export default VerticalFOVCanvas;
