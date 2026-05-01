import { useCallback, useRef } from "react";
import { clamp, useCanvasRenderer, type CanvasSize } from "@/hooks/useCanvasRenderer";

interface VerticalFOVCanvasProps {
  theta: number;
  thetaAproximado?: number;
  depressaoHorizonteDeg?: number;
  alpha: number;
  largura_km: number;
  h_visivel: number;
  h_oculta: number;
  h_turbina: number;
  dist_km: number;
  isVisible: boolean;
  atmosphericTransmission?: number;
  animate?: boolean;
}

const FOV_VERTICAL = 8;
const FOV_HORIZONTAL = 30;
const SUN_MOON_DEG = 0.5;
const TURBINE_SPACING_KM = 1.2;

const VerticalFOVCanvas = ({
  theta,
  thetaAproximado,
  depressaoHorizonteDeg = 0,
  alpha,
  largura_km,
  h_visivel,
  h_oculta,
  h_turbina,
  dist_km,
  isVisible,
  atmosphericTransmission = 1,
  animate = false,
}: VerticalFOVCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D, { width: w, height: h }: CanvasSize, time: number) => {
    const marginL = 64;
    const marginR = 28;
    const marginT = 56;
    const marginB = 64;
    const viewW = Math.max(1, w - marginL - marginR);
    const viewH = Math.max(1, h - marginT - marginB);
    const horizonY = marginT + viewH * 0.58;
    const pxPerDegV = viewH / FOV_VERTICAL;
    const pxPerDegH = viewW / FOV_HORIZONTAL;
    const centerX = marginL + viewW / 2;
    const distM = Math.max(dist_km * 1000, 1);
    const transmission = clamp(atmosphericTransmission, 0, 1);
    const fogOpacity = clamp(1 - transmission, 0, 0.86);
    const turbineOpacity = isVisible ? clamp(0.2 + transmission * 0.8, 0.2, 1) : 0.26;
    const thetaSpan = Math.max(thetaAproximado ?? theta - depressaoHorizonteDeg, 0);
    const thetaPx = thetaSpan * pxPerDegV;
    const depressionPx = depressaoHorizonteDeg * pxPerDegV;
    const hiddenDeg = (Math.atan(h_oculta / distM) * 180) / Math.PI;
    const hiddenPx = hiddenDeg > 0 ? clamp(Math.max(hiddenDeg * pxPerDegV, 6), 0, viewH * 0.34) : 0;
    const alphaPx = alpha * pxPerDegH;
    const parkLeft = centerX - alphaPx / 2;
    const parkRight = centerX + alphaPx / 2;
    const bladePhase = animate ? time * 0.0015 : -Math.PI / 2;
    const turbineCount = Math.max(2, Math.min(16, Math.round(Math.max(largura_km, 1) / TURBINE_SPACING_KM)));

    ctx.clearRect(0, 0, w, h);

    const skyGrad = ctx.createLinearGradient(0, marginT, 0, horizonY);
    skyGrad.addColorStop(0, "hsl(215 50% 12%)");
    skyGrad.addColorStop(1, "hsl(210 60% 28%)");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(marginL, marginT, viewW, horizonY - marginT);

    const seaGrad = ctx.createLinearGradient(0, horizonY, 0, marginT + viewH);
    seaGrad.addColorStop(0, "hsl(215 65% 18%)");
    seaGrad.addColorStop(1, "hsl(220 55% 8%)");
    ctx.fillStyle = seaGrad;
    ctx.fillRect(marginL, horizonY, viewW, marginT + viewH - horizonY);

    ctx.strokeStyle = "hsl(240 4% 25%)";
    ctx.lineWidth = 1;
    ctx.strokeRect(marginL, marginT, viewW, viewH);

    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let deg = -4; deg <= 4; deg += 1) {
      const y = horizonY - deg * pxPerDegV;
      if (y < marginT || y > marginT + viewH) continue;
      ctx.beginPath();
      ctx.moveTo(marginL - 4, y);
      ctx.lineTo(marginL + viewW, y);
      ctx.strokeStyle = deg === 0 ? "hsl(240 5% 72%)" : "hsla(240, 5%, 60%, 0.18)";
      ctx.lineWidth = deg === 0 ? 1.5 : 1;
      ctx.setLineDash(deg === 0 ? [6, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = deg === 0 ? "hsl(240 5% 82%)" : "hsl(240 4% 55%)";
      ctx.fillText(`${deg > 0 ? "+" : ""}${deg}°`, marginL - 8, y);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    for (let deg = -15; deg <= 15; deg += 5) {
      const x = centerX + deg * pxPerDegH;
      ctx.beginPath();
      ctx.moveTo(x, marginT - 4);
      ctx.lineTo(x, marginT + viewH);
      ctx.strokeStyle = deg === 0 ? "hsla(240, 5%, 72%, 0.55)" : "hsla(240, 5%, 60%, 0.12)";
      ctx.stroke();
      ctx.fillStyle = "hsl(240 4% 55%)";
      ctx.fillText(`${deg > 0 ? "+" : ""}${deg}°`, x, marginT - 6);
    }

    ctx.fillStyle = "hsl(240 5% 74%)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("HORIZONTE", marginL + 8, horizonY - 5);

    const referenceHeight = SUN_MOON_DEG * pxPerDegV;
    const referenceX = marginL + viewW - 72;
    const referenceY = marginT + 34;
    ctx.strokeStyle = "hsl(45 95% 68%)";
    ctx.fillStyle = "hsla(45, 95%, 68%, 0.16)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(referenceX, referenceY, referenceHeight / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "hsl(45 95% 72%)";
    ctx.font = "9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Sol/Lua 0,5°", referenceX, referenceY + referenceHeight / 2 + 14);

    if (h_visivel > 0 && thetaSpan > 0) {
      const actualTowerH = thetaPx;
      const isSubPixel = actualTowerH < 1.5;
      const drawableTowerH = Math.max(actualTowerH, isSubPixel ? 1.5 : 0);
      const topY = horizonY - depressionPx - drawableTowerH;
      const baseY = horizonY - depressionPx;
      const spacingPx = alphaPx / Math.max(turbineCount - 1, 1);
      const maxBladeLen = Math.max(3, Math.min(18, Math.abs(spacingPx) * 0.3));
      const clippedLeft = Math.max(parkLeft, marginL - 30);
      const clippedRight = Math.min(parkRight, marginL + viewW + 30);

      ctx.fillStyle = isVisible ? "hsla(142, 71%, 60%, 0.10)" : "hsla(240, 5%, 60%, 0.08)";
      ctx.fillRect(Math.max(marginL, parkLeft), topY - maxBladeLen, Math.max(0, Math.min(marginL + viewW, parkRight) - Math.max(marginL, parkLeft)), drawableTowerH + maxBladeLen * 2);

      for (let i = 0; i < turbineCount; i++) {
        const t = turbineCount === 1 ? 0.5 : i / (turbineCount - 1);
        const x = parkLeft + t * (parkRight - parkLeft);
        if (x < clippedLeft || x > clippedRight) continue;

        const distanceFromCenter = Math.abs(x - centerX) / Math.max(viewW / 2, 1);
        const rowOpacity = turbineOpacity * (1 - Math.min(distanceFromCenter * 0.35, 0.35));
        ctx.save();
        ctx.globalAlpha = rowOpacity;
        ctx.strokeStyle = isVisible ? "hsl(142 71% 78%)" : "hsl(240 5% 64%)";
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = Math.max(1, Math.min(2.5, drawableTowerH * 0.12));

        if (isSubPixel) {
          ctx.beginPath();
          ctx.arc(x, baseY, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x, baseY);
          ctx.lineTo(x, topY);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, topY, Math.max(1.5, Math.min(4, drawableTowerH * 0.08)), 0, Math.PI * 2);
          ctx.fill();
          for (let b = 0; b < 3; b++) {
            const angle = bladePhase + x * 0.01 + (b * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x + Math.cos(angle) * maxBladeLen, topY + Math.sin(angle) * maxBladeLen);
            ctx.stroke();
          }
        }
        ctx.restore();

        if (h_oculta > 0) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = "hsl(0 72% 63%)";
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(x, horizonY);
          ctx.lineTo(x, horizonY + hiddenPx);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }

      if (isSubPixel) {
        ctx.fillStyle = "hsl(45 95% 72%)";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("altura angular < 1,5 px nesta escala", centerX, Math.max(marginT + 18, topY - 10));
      }

      if (alpha > FOV_HORIZONTAL) {
        ctx.fillStyle = "hsl(0 72% 63%)";
        ctx.font = "9px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("◀ parque continua", marginL + 6, horizonY + 22);
        ctx.textAlign = "right";
        ctx.fillText("parque continua ▶", marginL + viewW - 6, horizonY + 22);
      }
    }

    if (fogOpacity > 0.02) {
      ctx.fillStyle = `hsla(205, 35%, 82%, ${fogOpacity * 0.62})`;
      ctx.fillRect(marginL, marginT, viewW, viewH);
    }

    const legendX = marginL + 12;
    const legendTop = marginT + 12;
    const legendW = 288;
    const legendH = 104;
    ctx.fillStyle = "hsla(215, 50%, 12%, 0.86)";
    ctx.beginPath();
    ctx.roundRect(legendX, legendTop, legendW, legendH, 10);
    ctx.fill();
    ctx.strokeStyle = isVisible ? "hsla(142, 71%, 60%, 0.5)" : "hsla(0, 72%, 63%, 0.5)";
    ctx.stroke();

    ctx.fillStyle = isVisible ? "hsl(142 71% 80%)" : "hsl(0 72% 70%)";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(isVisible ? "Turbinas detectáveis" : h_visivel > 0 ? "Bloqueio atmosférico" : "Ocultas pelo horizonte", legendX + 10, legendTop + 9);
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = "hsl(240 4% 74%)";
    ctx.fillText(`θ real = ${theta.toFixed(4)}° · θ geom = ${thetaSpan.toFixed(4)}°`, legendX + 10, legendTop + 30);
    ctx.fillText(`Depressão do horizonte = ${depressaoHorizonteDeg.toFixed(4)}°`, legendX + 10, legendTop + 47);
    ctx.fillText(`α = ${alpha.toFixed(2)}° · transmissão = ${(transmission * 100).toFixed(0)}%`, legendX + 10, legendTop + 64);
    ctx.fillText(`Oculto: ${h_oculta.toFixed(1)} m · visível: ${h_visivel.toFixed(1)} m`, legendX + 10, legendTop + 81);

    if (h_visivel <= 0) {
      ctx.fillStyle = "hsl(0 72% 63%)";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TURBINAS 100% OCULTAS PELO HORIZONTE", centerX, horizonY - 20);
    } else if (!isVisible) {
      ctx.fillStyle = "hsl(0 72% 50%)";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ATENUADO PELA NÉVOA", centerX, horizonY - 20);
    }

    const barY = marginT + viewH + 24;
    const barH = 6;
    const halfW = (viewW - 16) / 2;
    ctx.fillStyle = "hsl(240 4% 18%)";
    ctx.fillRect(marginL, barY, halfW, barH);
    ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
    ctx.fillRect(marginL, barY, Math.min(theta / FOV_VERTICAL, 1) * halfW, barH);
    ctx.fillStyle = "hsl(240 4% 65%)";
    ctx.font = "9px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Vertical θ: ${((theta / FOV_VERTICAL) * 100).toFixed(3)}% do FOV`, marginL, barY + barH + 3);

    const barX2 = marginL + halfW + 16;
    ctx.fillStyle = "hsl(240 4% 18%)";
    ctx.fillRect(barX2, barY, halfW, barH);
    ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
    ctx.fillRect(barX2, barY, Math.min(alpha / FOV_HORIZONTAL, 1) * halfW, barH);
    ctx.fillStyle = "hsl(240 4% 65%)";
    ctx.fillText(`Horizontal α: ${((alpha / FOV_HORIZONTAL) * 100).toFixed(2)}% do FOV${alpha > FOV_HORIZONTAL ? " (excede)" : ""}`, barX2, barY + barH + 3);
  }, [alpha, animate, atmosphericTransmission, depressaoHorizonteDeg, dist_km, h_oculta, h_turbina, h_visivel, isVisible, largura_km, theta, thetaAproximado]);

  useCanvasRenderer(canvasRef, draw, animate);

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col panel-glow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
        <span className="text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
          Simulação POV — Impacto Vertical (θ) + Largura do Parque (α)
        </span>
        <span className="text-[10px] text-muted-foreground">
          Render sob demanda · FOV {FOV_VERTICAL}° × {FOV_HORIZONTAL}° · Sol/Lua 0,5°
        </span>
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400 }} />
    </div>
  );
};

export default VerticalFOVCanvas;
