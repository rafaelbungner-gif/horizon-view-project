import { useRef, useEffect } from "react";

interface VerticalFOVCanvasProps {
  theta: number; // ângulo vertical visível (graus)
  alpha: number; // ocupação horizontal do parque (graus)
  largura_km: number;
  h_visivel: number;
  h_oculta: number;
  h_turbina: number;
  dist_km: number;
  isVisible: boolean;
}

const FOV_VERTICAL = 60; // graus úteis de visão vertical humana
const FOV_HORIZONTAL = 60; // graus exibidos na janela POV horizontalmente

const VerticalFOVCanvas = ({
  theta,
  alpha,
  largura_km,
  h_visivel,
  h_oculta,
  h_turbina,
  dist_km,
  isVisible,
}: VerticalFOVCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Margens (top maior para a régua horizontal)
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

      // ===== Fundo: céu (cima) e mar (baixo)
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

      // ===== Régua angular vertical (lateral)
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

      // ===== Régua angular horizontal (topo)
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

      // ===== Linha do horizonte
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

      // ===== Moldura
      ctx.strokeStyle = "hsl(240 4% 25%)";
      ctx.lineWidth = 1;
      ctx.strokeRect(marginL, marginT, viewW, viewH);

      // ===== FOV info (topo direito)
      ctx.fillStyle = "hsl(240 4% 55%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(`FOV ${FOV_HORIZONTAL}°H × ${FOV_VERTICAL}°V`, marginL + viewW - 4, marginT + 4);

      // ===== Faixa angular do parque (α) - destaque no horizonte
      const alphaPxFull = alpha * pxPerDegH;
      const alphaPxClamped = Math.min(alphaPxFull, viewW);
      const parkLeft = Math.max(centerX - alphaPxFull / 2, marginL);
      const parkRight = Math.min(centerX + alphaPxFull / 2, marginL + viewW);
      const overflowsFOV = alpha > FOV_HORIZONTAL;

      // Faixa de destaque (sutil) cobrindo a região do parque no céu próximo ao horizonte
      const bandColor = isVisible
        ? "hsla(142, 71%, 60%, 0.10)"
        : "hsla(240, 5%, 60%, 0.10)";
      ctx.fillStyle = bandColor;
      const previewThetaPx = Math.max(theta * pxPerDegV, 12);
      const bandTop = horizonY - previewThetaPx - 6;
      const bandH = horizonY - bandTop;
      ctx.fillRect(parkLeft, bandTop, parkRight - parkLeft, bandH);

      // ===== Desenho de uma turbina (helper)
      const drawTurbine = (
        x: number,
        baseY: number,
        topY: number,
        opts: { isHidden?: boolean; alpha?: number; scale?: number } = {},
      ) => {
        const { isHidden = false, alpha: a = 1, scale = 1 } = opts;
        const towerH = baseY - topY;
        if (towerH <= 0) return;
        const towerWBase = Math.max(2, towerH * 0.06) * scale;
        const towerWTop = Math.max(1.5, towerH * 0.03) * scale;

        ctx.globalAlpha = a;

        ctx.beginPath();
        ctx.moveTo(x - towerWBase / 2, baseY);
        ctx.lineTo(x - towerWTop / 2, topY);
        ctx.lineTo(x + towerWTop / 2, topY);
        ctx.lineTo(x + towerWBase / 2, baseY);
        ctx.closePath();

        if (isHidden) {
          ctx.strokeStyle = "hsl(0 72% 63%)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 60%)";
          ctx.fill();

          const nacelleR = Math.max(2, towerH * 0.05) * scale;
          ctx.beginPath();
          ctx.arc(x, topY, nacelleR, 0, Math.PI * 2);
          ctx.fill();

          const bladeLen = Math.max(8, towerH * 0.4) * scale;
          const rot = Date.now() * 0.0015 + x * 0.01;
          ctx.strokeStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 60%)";
          ctx.lineWidth = Math.max(1.2, towerH * 0.02) * scale;
          ctx.lineCap = "round";
          for (let b = 0; b < 3; b++) {
            const ang = rot + (b * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x + Math.cos(ang) * bladeLen, topY + Math.sin(ang) * bladeLen);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;
      };

      // ===== Múltiplas turbinas distribuídas em α
      const thetaPx = theta * pxPerDegV;

      // Nº de turbinas baseado na largura do parque (~1 km de espaçamento típico)
      const N = Math.max(3, Math.min(15, Math.round(largura_km / 1.0)));

      // Espaçamento real entre turbinas (px) e escala adaptativa
      const alphaPxForSpacing = alpha > 0 ? alpha * pxPerDegH : viewW;
      const spacingPx = alphaPxForSpacing / Math.max(N - 1, 1);
      // Mínimo de leitura encolhe quando turbinas estão apertadas
      const minLeitura = Math.max(6, Math.min(18, spacingPx * 0.35));
      // Largura máxima por turbina deixa 30% de respiro entre vizinhas
      const maxTurbineWidth = spacingPx * 0.7;
      // Pás ocupam ~0.4 * towerH de cada lado → largura total ~0.85 * towerH
      const maxTowerH = Math.max(minLeitura, maxTurbineWidth / 0.85);
      const drawnPx = Math.min(Math.max(thetaPx, minLeitura), maxTowerH);

      // Distribui dentro da faixa angular α; se overflow, ainda assim posiciona
      // dentro da viewport (alguns ficarão clipados nas bordas).
      const positions: number[] = [];
      if (N === 1) {
        positions.push(centerX);
      } else {
        for (let i = 0; i < N; i++) {
          const t = i / (N - 1); // 0..1
          const deg = -alpha / 2 + t * alpha;
          positions.push(centerX + deg * pxPerDegH);
        }
      }

      // Hidden segment (abaixo do horizonte) - calcula uma vez
      const distM = Math.max(dist_km * 1000, 1);
      const hiddenDeg = (Math.atan(h_oculta / distM) * 180) / Math.PI;
      const hiddenPx = Math.min(hiddenDeg * pxPerDegV, viewH / 2 - 4);

      if (theta > 0 && h_visivel > 0) {
        positions.forEach((x) => {
          // perspectiva atmosférica: turbinas das bordas mais transparentes
          const distFromCenter = Math.abs(x - centerX) / (viewW / 2);
          const a = 1 - Math.min(distFromCenter * 0.4, 0.4);
          // só desenha se estiver visível na viewport
          if (x < marginL - 20 || x > marginL + viewW + 20) return;
          drawTurbine(x, horizonY, horizonY - drawnPx, { alpha: a });

          if (h_oculta > 0 && hiddenPx > 1) {
            drawTurbine(x, horizonY + hiddenPx, horizonY, { isHidden: true, alpha: a });
          }
        });

        // Indicador θ — legenda flutuante no canto superior esquerdo
        const legendPad = 8;
        const legendBarH = Math.max(drawnPx, 14);
        const legendLabel = `θ = ${theta.toFixed(3)}°`;
        const showMinNote = drawnPx > thetaPx + 1;
        const minNote = "(escala mín. p/ leitura)";

        ctx.font = "bold 11px Inter, sans-serif";
        const labelW = ctx.measureText(legendLabel).width;
        ctx.font = "9px Inter, sans-serif";
        const noteW = showMinNote ? ctx.measureText(minNote).width : 0;
        const textW = Math.max(labelW, noteW);

        const legendX = marginL + 12;
        const legendTop = marginT + 12;
        const legendBarX = legendX + legendPad;
        const legendBarTop = legendTop + legendPad;
        const legendBarBottom = legendBarTop + legendBarH;
        const boxW = legendPad * 2 + 14 + textW + 4;
        const boxH = legendPad * 2 + legendBarH + (showMinNote ? 12 : 0);

        // Fundo arredondado
        ctx.fillStyle = "hsla(215, 50%, 12%, 0.78)";
        const r = 6;
        ctx.beginPath();
        ctx.moveTo(legendX + r, legendTop);
        ctx.lineTo(legendX + boxW - r, legendTop);
        ctx.quadraticCurveTo(legendX + boxW, legendTop, legendX + boxW, legendTop + r);
        ctx.lineTo(legendX + boxW, legendTop + boxH - r);
        ctx.quadraticCurveTo(legendX + boxW, legendTop + boxH, legendX + boxW - r, legendTop + boxH);
        ctx.lineTo(legendX + r, legendTop + boxH);
        ctx.quadraticCurveTo(legendX, legendTop + boxH, legendX, legendTop + boxH - r);
        ctx.lineTo(legendX, legendTop + r);
        ctx.quadraticCurveTo(legendX, legendTop, legendX + r, legendTop);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "hsla(142, 71%, 60%, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Mini-régua vertical com setas
        ctx.strokeStyle = "hsl(142 71% 75%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(legendBarX, legendBarTop);
        ctx.lineTo(legendBarX, legendBarBottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(legendBarX - 4, legendBarTop + 4);
        ctx.lineTo(legendBarX, legendBarTop);
        ctx.lineTo(legendBarX + 4, legendBarTop + 4);
        ctx.moveTo(legendBarX - 4, legendBarBottom - 4);
        ctx.lineTo(legendBarX, legendBarBottom);
        ctx.lineTo(legendBarX + 4, legendBarBottom - 4);
        ctx.stroke();

        // Label
        ctx.fillStyle = "hsl(142 71% 80%)";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(legendLabel, legendBarX + 8, legendBarTop + legendBarH / 2);

        if (showMinNote) {
          ctx.fillStyle = "hsl(240 4% 65%)";
          ctx.font = "9px Inter, sans-serif";
          ctx.textBaseline = "top";
          ctx.fillText(minNote, legendX + legendPad, legendBarBottom + 2);
        }
      }

      // ===== Indicador α (abaixo do horizonte)
      if (alpha > 0 && h_visivel > 0) {
        const alphaY = horizonY + Math.max(hiddenPx, 0) + 18;
        const aLeft = Math.max(parkLeft, marginL + 2);
        const aRight = Math.min(parkRight, marginL + viewW - 2);

        ctx.strokeStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(240 5% 60%)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(aLeft, alphaY);
        ctx.lineTo(aRight, alphaY);
        ctx.stroke();
        // setas (ou "fora do FOV" indicators)
        if (!overflowsFOV) {
          ctx.beginPath();
          ctx.moveTo(aLeft + 6, alphaY - 4);
          ctx.lineTo(aLeft, alphaY);
          ctx.lineTo(aLeft + 6, alphaY + 4);
          ctx.moveTo(aRight - 6, alphaY - 4);
          ctx.lineTo(aRight, alphaY);
          ctx.lineTo(aRight - 6, alphaY + 4);
          ctx.stroke();
        } else {
          // marcadores "continua além do FOV"
          ctx.fillStyle = "hsl(0 72% 63%)";
          ctx.font = "9px Inter, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText("◀ continua", marginL + 4, alphaY);
          ctx.textAlign = "right";
          ctx.fillText("continua ▶", marginL + viewW - 4, alphaY);
        }

        ctx.fillStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 70%)";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(
          `α = ${alpha.toFixed(2)}°  ·  largura ≈ ${largura_km.toFixed(1)} km`,
          centerX,
          alphaY + 6,
        );
      }

      // ===== Mensagem se totalmente oculta
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

      // ===== Lupa (zoom) quando θ < 0.5° — turbina central representativa
      if (isVisible && theta > 0 && theta < 0.5) {
        const lupaR = 56;
        const lupaCx = marginL + viewW - lupaR - 12;
        const lupaCy = marginT + viewH - lupaR - 12;

        ctx.save();
        ctx.beginPath();
        ctx.arc(lupaCx, lupaCy, lupaR, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(215 50% 12%)";
        ctx.fill();
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(lupaCx - lupaR, lupaCy);
        ctx.lineTo(lupaCx + lupaR, lupaCy);
        ctx.strokeStyle = "hsl(240 5% 70%)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        const zoom = 20;
        const zoomedPx = Math.min(theta * pxPerDegV * zoom, lupaR * 1.6);
        const zTopY = lupaCy - zoomedPx;
        const zTowerH = lupaCy - zTopY;
        const zTowerWBase = Math.max(2, zTowerH * 0.07);
        const zTowerWTop = Math.max(1.5, zTowerH * 0.04);
        ctx.beginPath();
        ctx.moveTo(lupaCx - zTowerWBase / 2, lupaCy);
        ctx.lineTo(lupaCx - zTowerWTop / 2, zTopY);
        ctx.lineTo(lupaCx + zTowerWTop / 2, zTopY);
        ctx.lineTo(lupaCx + zTowerWBase / 2, lupaCy);
        ctx.closePath();
        ctx.fillStyle = "hsl(142 71% 75%)";
        ctx.fill();

        const zNac = Math.max(2, zTowerH * 0.06);
        ctx.beginPath();
        ctx.arc(lupaCx, zTopY, zNac, 0, Math.PI * 2);
        ctx.fill();

        const zBlade = Math.max(8, zTowerH * 0.45);
        const rot = Date.now() * 0.0015;
        ctx.strokeStyle = "hsl(142 71% 75%)";
        ctx.lineWidth = Math.max(1.2, zTowerH * 0.025);
        ctx.lineCap = "round";
        for (let b = 0; b < 3; b++) {
          const ang = rot + (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.moveTo(lupaCx, zTopY);
          ctx.lineTo(lupaCx + Math.cos(ang) * zBlade, zTopY + Math.sin(ang) * zBlade);
          ctx.stroke();
        }

        ctx.restore();

        ctx.beginPath();
        ctx.arc(lupaCx, lupaCy, lupaR, 0, Math.PI * 2);
        ctx.strokeStyle = "hsl(142 71% 75%)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "hsl(142 71% 75%)";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("ZOOM 20× (turbina central)", lupaCx, lupaCy + lupaR + 4);
      }

      // ===== Barra de rodapé com duas métricas
      const barY = marginT + viewH + 22;
      const barH = 6;
      const halfW = (viewW - 16) / 2;

      // Vertical
      ctx.fillStyle = "hsl(240 4% 18%)";
      ctx.fillRect(marginL, barY, halfW, barH);
      const ratioV = Math.min(theta / FOV_VERTICAL, 1);
      ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
      ctx.fillRect(marginL, barY, Math.max(ratioV * halfW, theta > 0 ? 2 : 0), barH);
      ctx.fillStyle = "hsl(240 4% 65%)";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(
        `Vertical θ: ${((theta / FOV_VERTICAL) * 100).toFixed(4)}% do FOV`,
        marginL,
        barY + barH + 3,
      );

      // Horizontal
      const barX2 = marginL + halfW + 16;
      ctx.fillStyle = "hsl(240 4% 18%)";
      ctx.fillRect(barX2, barY, halfW, barH);
      const ratioH = Math.min(alpha / FOV_HORIZONTAL, 1);
      ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
      ctx.fillRect(barX2, barY, Math.max(ratioH * halfW, alpha > 0 ? 2 : 0), barH);
      ctx.fillStyle = "hsl(240 4% 65%)";
      ctx.fillText(
        `Horizontal α: ${((alpha / FOV_HORIZONTAL) * 100).toFixed(2)}% do FOV${overflowsFOV ? " (excede!)" : ""}`,
        barX2,
        barY + barH + 3,
      );

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [theta, alpha, largura_km, h_visivel, h_oculta, h_turbina, dist_km, isVisible]);

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col panel-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
          Simulação POV — Impacto Vertical (θ) + Largura do Parque (α)
        </span>
        <span className="text-[10px] text-muted-foreground">
          Visão em primeira pessoa · FOV 60° × 60°
        </span>
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400 }} />
    </div>
  );
};

export default VerticalFOVCanvas;
