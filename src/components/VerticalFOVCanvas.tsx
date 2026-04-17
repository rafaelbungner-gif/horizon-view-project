import { useRef, useEffect } from "react";

interface VerticalFOVCanvasProps {
  theta: number; // ângulo vertical visível (graus)
  h_visivel: number;
  h_oculta: number;
  h_turbina: number;
  dist_km: number;
  isVisible: boolean;
}

const FOV_VERTICAL = 60; // graus úteis de visão vertical humana

const VerticalFOVCanvas = ({
  theta,
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

      // Margens para a régua angular
      const marginL = 56;
      const marginR = 24;
      const marginT = 36;
      const marginB = 36;
      const viewW = w - marginL - marginR;
      const viewH = h - marginT - marginB;
      const horizonY = marginT + viewH / 2;
      const pxPerDeg = viewH / FOV_VERTICAL;

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

      // ===== Régua angular lateral
      ctx.strokeStyle = "hsl(240 4% 25%)";
      ctx.fillStyle = "hsl(240 4% 55%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let deg = -30; deg <= 30; deg += 5) {
        const y = horizonY - deg * pxPerDeg;
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

      // ===== Linha do horizonte
      ctx.beginPath();
      ctx.moveTo(marginL, horizonY);
      ctx.lineTo(marginL + viewW, horizonY);
      ctx.strokeStyle = "hsl(240 5% 70%)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label horizonte
      ctx.fillStyle = "hsl(240 5% 70%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("HORIZONTE", marginL + 6, horizonY - 4);

      // ===== Moldura
      ctx.strokeStyle = "hsl(240 4% 25%)";
      ctx.lineWidth = 1;
      ctx.strokeRect(marginL, marginT, viewW, viewH);

      // ===== FOV info (topo)
      ctx.fillStyle = "hsl(240 4% 55%)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(`FOV vertical: ${FOV_VERTICAL}°`, marginL + viewW - 4, marginT + 4);

      // ===== Desenho da turbina
      const turbineX = marginL + viewW * 0.5;

      // Altura angular total da turbina (visível + oculta visualizada como referência)
      // Apenas h_visivel sai acima do horizonte (theta em graus).
      const thetaPx = theta * pxPerDeg;
      // Para porção oculta: ângulo aproximado da torre oculta, simétrico abaixo do horizonte
      // h_oculta projetada angular ~ atan(h_oculta / dist_m); usamos isso só para visualização.
      const distM = Math.max(dist_km * 1000, 1);
      const hiddenDeg = (Math.atan(h_oculta / distM) * 180) / Math.PI;
      const hiddenPx = Math.min(hiddenDeg * pxPerDeg, viewH / 2 - 4);

      const drawTurbine = (
        baseY: number,
        topY: number,
        isHidden: boolean,
        scale = 1,
      ) => {
        const towerH = baseY - topY;
        if (towerH <= 0) return;
        const towerWBase = Math.max(2, towerH * 0.06) * scale;
        const towerWTop = Math.max(1.5, towerH * 0.03) * scale;

        // Torre
        ctx.beginPath();
        ctx.moveTo(turbineX - towerWBase / 2, baseY);
        ctx.lineTo(turbineX - towerWTop / 2, topY);
        ctx.lineTo(turbineX + towerWTop / 2, topY);
        ctx.lineTo(turbineX + towerWBase / 2, baseY);
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
        }

        // Nacelle + pás (só na porção visível e topo)
        if (!isHidden) {
          const nacelleR = Math.max(2, towerH * 0.05) * scale;
          ctx.fillStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 60%)";
          ctx.beginPath();
          ctx.arc(turbineX, topY, nacelleR, 0, Math.PI * 2);
          ctx.fill();

          const bladeLen = Math.max(8, towerH * 0.4) * scale;
          const rot = Date.now() * 0.0015;
          ctx.strokeStyle = isVisible ? "hsl(142 71% 75%)" : "hsl(240 5% 60%)";
          ctx.lineWidth = Math.max(1.2, towerH * 0.02) * scale;
          ctx.lineCap = "round";
          for (let b = 0; b < 3; b++) {
            const a = rot + (b * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.moveTo(turbineX, topY);
            ctx.lineTo(
              turbineX + Math.cos(a) * bladeLen,
              topY + Math.sin(a) * bladeLen,
            );
            ctx.stroke();
          }
        }
      };

      // ===== Porção visível (acima do horizonte)
      if (theta > 0 && h_visivel > 0) {
        // Para tornar perceptível visualmente mesmo com θ pequeno,
        // usamos uma altura mínima de pixels (sem mentir sobre θ — texto mostra o real).
        const minVisualPx = 18;
        const drawnPx = Math.max(thetaPx, minVisualPx);
        drawTurbine(horizonY, horizonY - drawnPx, false, 1);

        // Indicador θ
        const labelY = horizonY - drawnPx - 8;
        ctx.strokeStyle = "hsl(142 71% 75%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(turbineX + 22, horizonY);
        ctx.lineTo(turbineX + 22, horizonY - drawnPx);
        ctx.stroke();
        // Setas
        ctx.beginPath();
        ctx.moveTo(turbineX + 18, horizonY - 4);
        ctx.lineTo(turbineX + 22, horizonY);
        ctx.lineTo(turbineX + 26, horizonY - 4);
        ctx.moveTo(turbineX + 18, horizonY - drawnPx + 4);
        ctx.lineTo(turbineX + 22, horizonY - drawnPx);
        ctx.lineTo(turbineX + 26, horizonY - drawnPx + 4);
        ctx.stroke();

        ctx.fillStyle = "hsl(142 71% 75%)";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `θ = ${theta.toFixed(3)}°`,
          turbineX + 30,
          horizonY - drawnPx / 2,
        );

        if (drawnPx > thetaPx + 1) {
          ctx.fillStyle = "hsl(240 4% 55%)";
          ctx.font = "9px Inter, sans-serif";
          ctx.fillText("(escala mín. p/ leitura)", turbineX + 30, labelY + 14);
        }
      }

      // ===== Porção oculta (abaixo do horizonte, tracejada vermelha)
      if (h_oculta > 0 && hiddenPx > 1) {
        drawTurbine(horizonY + hiddenPx, horizonY, true, 1);
        ctx.fillStyle = "hsl(0 72% 63%)";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `oculto: ${h_oculta.toFixed(0)} m`,
          turbineX + 14,
          horizonY + hiddenPx / 2,
        );
      }

      // ===== Mensagem se totalmente oculta
      if (h_visivel <= 0) {
        ctx.fillStyle = "hsl(0 72% 63%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("TURBINA 100% OCULTA PELO HORIZONTE", turbineX, horizonY - 20);
      } else if (!isVisible) {
        // Cortina de névoa
        ctx.fillStyle = "hsla(240, 5%, 70%, 0.55)";
        ctx.fillRect(marginL, marginT, viewW, viewH);
        ctx.fillStyle = "hsl(0 72% 50%)";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ATENUADO PELA NÉVOA", turbineX, horizonY - 20);
      }

      // ===== Lupa (zoom) quando θ < 0.5°
      if (isVisible && theta > 0 && theta < 0.5) {
        const lupaR = 56;
        const lupaCx = marginL + viewW - lupaR - 12;
        const lupaCy = marginT + viewH - lupaR - 12;

        // Fundo lupa
        ctx.save();
        ctx.beginPath();
        ctx.arc(lupaCx, lupaCy, lupaR, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(215 50% 12%)";
        ctx.fill();
        ctx.clip();

        // Horizonte na lupa
        ctx.beginPath();
        ctx.moveTo(lupaCx - lupaR, lupaCy);
        ctx.lineTo(lupaCx + lupaR, lupaCy);
        ctx.strokeStyle = "hsl(240 5% 70%)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Turbina ampliada (zoom 20×, limitado)
        const zoom = 20;
        const zoomedPx = Math.min(theta * pxPerDeg * zoom, lupaR * 1.6);
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
          const a = rot + (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.moveTo(lupaCx, zTopY);
          ctx.lineTo(lupaCx + Math.cos(a) * zBlade, zTopY + Math.sin(a) * zBlade);
          ctx.stroke();
        }

        ctx.restore();

        // Borda lupa
        ctx.beginPath();
        ctx.arc(lupaCx, lupaCy, lupaR, 0, Math.PI * 2);
        ctx.strokeStyle = "hsl(142 71% 75%)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label lupa
        ctx.fillStyle = "hsl(142 71% 75%)";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("ZOOM 20×", lupaCx, lupaCy + lupaR + 4);
      }

      // ===== Barra proporcional θ vs FOV no rodapé
      const barY = marginT + viewH + 14;
      const barH = 6;
      const barW = viewW;
      const barX = marginL;
      ctx.fillStyle = "hsl(240 4% 18%)";
      ctx.fillRect(barX, barY, barW, barH);
      const ratio = Math.min(theta / FOV_VERTICAL, 1);
      const fillW = Math.max(ratio * barW, theta > 0 ? 2 : 0);
      ctx.fillStyle = isVisible ? "hsl(142 71% 60%)" : "hsl(0 72% 63%)";
      ctx.fillRect(barX, barY, fillW, barH);

      ctx.fillStyle = "hsl(240 4% 55%)";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(
        `Ocupação vertical: ${((theta / FOV_VERTICAL) * 100).toFixed(4)}% do FOV humano`,
        barX,
        barY + barH + 3,
      );

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [theta, h_visivel, h_oculta, h_turbina, dist_km, isVisible]);

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col panel-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
          Simulação POV — Impacto Vertical (θ)
        </span>
        <span className="text-[10px] text-muted-foreground">
          Visão em primeira pessoa · FOV 60°
        </span>
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360 }} />
    </div>
  );
};

export default VerticalFOVCanvas;
