import { useMemo, useState } from "react";
import { Download, FileText, Wind } from "lucide-react";
import { calculate, type CalcInputs, type CalcOutputs, type LimitingFactor, type VisibilityReason } from "@/lib/calculations";
import MetricCard from "@/components/MetricCard";
import ControlSlider from "@/components/ControlSlider";
import FOVCanvas from "@/components/FOVCanvas";
import ProfileCanvas from "@/components/ProfileCanvas";
import VerticalFOVCanvas from "@/components/VerticalFOVCanvas";
import TechnicalDocs from "@/components/TechnicalDocs";

const DEFAULT_INPUTS: CalcInputs = {
  dist_km: 35,
  h_turbina: 260,
  h_obs: 10,
  largura_km: 12,
  num_turbinas: 9,
  area: 1500,
  ci: 35,
  k: 1.13,
  beta: 0.00004,
};

const VISIBILITY_COPY: Record<VisibilityReason, { title: string; body: string; badge: string }> = {
  visible: {
    title: "Detectável",
    body: "A turbina vence a curvatura e mantém contraste acima do limiar operacional.",
    badge: "text-success border-success/40 bg-success/10",
  },
  no_structure: {
    title: "Sem estrutura",
    body: "A altura da turbina está zerada, então não há alvo visual para simular.",
    badge: "text-muted-foreground border-border bg-secondary/40",
  },
  hidden_by_horizon: {
    title: "Bloqueada pelo horizonte",
    body: "A curvatura oculta toda a altura informada antes de considerar a atmosfera.",
    badge: "text-destructive border-destructive/40 bg-destructive/10",
  },
  blocked_by_atmosphere: {
    title: "Perdida na atmosfera",
    body: "Existe altura acima do horizonte, mas o contraste cai abaixo de 2%.",
    badge: "text-warning border-warning/40 bg-warning/10",
  },
  hidden_and_blocked: {
    title: "Horizonte + atmosfera",
    body: "A geometria já oculta a turbina e a atmosfera também derruba o contraste.",
    badge: "text-destructive border-destructive/40 bg-destructive/10",
  },
};

const LIMITING_FACTOR_COPY: Record<LimitingFactor, string> = {
  geometry: "Geometria / curvatura",
  atmosphere: "Atmosfera / contraste",
  both: "Geometria e atmosfera empatadas",
  none: "Sem limitante dominante",
};

const formatPct = (value: number) => `${value.toFixed(1)}%`;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const formatKm = (value: number) => {
  if (!Number.isFinite(value)) return "sem limite";
  return `${value.toFixed(1)} km`;
};

const formatAtmosphericKm = (value: number) => {
  if (!Number.isFinite(value)) return "sem limite atmos.";
  if (value <= 0) return "0,0 km (já invisível)";
  return `${value.toFixed(1)} km`;
};

const getAtmosphericTransmission = (inputs: CalcInputs, out: CalcOutputs) => {
  if (inputs.ci <= 0) return 0;
  return clamp01(out.cd / inputs.ci);
};

const buildScenarioLines = (inputs: CalcInputs, out: CalcOutputs) => [
  `Diagnóstico: ${VISIBILITY_COPY[out.visibilityReason].title}`,
  `Distância: ${inputs.dist_km.toFixed(1)} km | Observador: ${inputs.h_obs.toFixed(1)} m | Turbina: ${inputs.h_turbina.toFixed(1)} m`,
  `Largura: ${inputs.largura_km.toFixed(1)} km | Turbinas: ${inputs.num_turbinas} | Espaçamento: ${out.distancia_entre_turbinas_km.toFixed(2)} km`,
  `Visível: ${out.h_visivel.toFixed(1)} m | Oculto: ${out.h_oculta.toFixed(1)} m`,
  `Ângulos: α ${out.alpha.toFixed(2)}° | θ real ${out.theta.toFixed(4)}° | θ geom ${out.theta_aproximado.toFixed(4)}°`,
  `Depressão do horizonte: ${out.depressao_horizonte_deg.toFixed(4)}° | Prob.: ${formatPct(out.prob_pct)}`,
  `Contraste remanescente: ${out.cd.toFixed(2)}% | transmissão atmos.: ${formatPct(getAtmosphericTransmission(inputs, out) * 100)}`,
  `Limite geométrico: ${formatKm(out.distancia_geometrica_max_km)} | Limite atmosférico: ${formatAtmosphericKm(out.distancia_atmosferica_max_km)}`,
  `Limitante dominante: ${LIMITING_FACTOR_COPY[out.limitingFactor]}`,
];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
      return;
    }
    line = testLine;
  });

  if (line) ctx.fillText(line, x, cursorY);
  return cursorY + lineHeight;
};

const downloadSummaryPng = (inputs: CalcInputs, out: CalcOutputs) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 820;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#08111f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#10243a";
  ctx.fillRect(48, 48, canvas.width - 96, canvas.height - 96);
  ctx.strokeStyle = "#5db5ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  ctx.fillStyle = "#f4f7fb";
  ctx.font = "bold 38px Arial";
  ctx.fillText("Resumo técnico - Paisagem Marinha Eólica", 84, 112);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#aac0d6";
  ctx.fillText(new Date().toLocaleString("pt-BR"), 84, 148);

  let y = 220;
  ctx.fillStyle = "#7dd3fc";
  ctx.font = "bold 24px Arial";
  ctx.fillText("CENÁRIO ATUAL", 84, y);
  y += 46;
  ctx.fillStyle = "#f4f7fb";
  ctx.font = "20px Arial";
  buildScenarioLines(inputs, out).forEach((line) => {
    y = drawWrappedText(ctx, line, 84, y, 980, 30) + 10;
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `resumo-paisagem-marinha-${new Date().toISOString().slice(0, 10)}.png`;
  link.click();
};

const printSummaryPdf = (inputs: CalcInputs, out: CalcOutputs) => {
  const body = buildScenarioLines(inputs, out).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Resumo técnico - Paisagem Marinha Eólica</title>
        <style>
          body { font-family: Arial, sans-serif; color: #122033; margin: 40px; line-height: 1.45; }
          h1 { color: #0f5f8f; }
          p { margin: 8px 0; }
        </style>
      </head>
      <body>
        <h1>Resumo técnico - Paisagem Marinha Eólica</h1>
        <p>Gerado em ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
        ${body}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 250);
};

const Index = () => {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS);
  const [animateCanvases, setAnimateCanvases] = useState(false);

  const set = (key: keyof CalcInputs) => (v: number) =>
    setInputs((prev) => ({ ...prev, [key]: key === "num_turbinas" ? Math.round(v) : v }));

  const out = useMemo(() => calculate(inputs), [inputs]);
  const atmosphericTransmission = getAtmosphericTransmission(inputs, out);
  const visibilityCopy = VISIBILITY_COPY[out.visibilityReason];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-[1500px] space-y-6">
        <header className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 panel-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wind className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Paisagem Marinha Eólica</h1>
              <p className="text-xs text-muted-foreground">Simulação EVP de visibilidade, contraste e ocupação angular</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricCard label="Oculto (m)" value={out.h_oculta.toFixed(1)} color="destructive" />
            <MetricCard label="Visível (m)" value={out.h_visivel.toFixed(1)} color={out.h_visivel > 0 ? "success" : "destructive"} />
            <MetricCard label="θ real" value={`${out.theta.toFixed(4)}°`} color="accent" />
            <MetricCard label="Espaçamento" value={`${out.distancia_entre_turbinas_km.toFixed(2)} km`} color="primary" />
            <MetricCard label="Transmissão" value={formatPct(atmosphericTransmission * 100)} color={out.isVisible ? "success" : "warning"} />
            <MetricCard label="Prob. Detecção" value={out.isVisible ? `${out.prob_pct.toFixed(1)}%` : "0.0%"} color={out.isVisible ? "accent" : "destructive"} />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
          <section className="bg-card border border-border rounded-lg p-5 panel-glow space-y-4">
            <div>
              <h2 className="text-sm font-bold tracking-[0.1em] text-muted-foreground uppercase">Diagnóstico do cenário</h2>
              <p className="text-xs text-muted-foreground mt-1">Ajuste os parâmetros abaixo para avaliar o cenário atual sem presets ou comparação A/B.</p>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-[0.65rem] font-bold uppercase ${visibilityCopy.badge}`}>{visibilityCopy.title}</span>
                  <p className="mt-2 text-sm text-muted-foreground">{visibilityCopy.body}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs min-w-[420px]">
                  <div className="rounded bg-secondary/60 p-3">
                    <span className="text-muted-foreground">Limite geométrico</span>
                    <strong className="block text-foreground text-base">{formatKm(out.distancia_geometrica_max_km)}</strong>
                  </div>
                  <div className="rounded bg-secondary/60 p-3">
                    <span className="text-muted-foreground">Limite atmosférico</span>
                    <strong className="block text-foreground text-base">{formatAtmosphericKm(out.distancia_atmosferica_max_km)}</strong>
                  </div>
                  <div className="rounded bg-secondary/60 p-3">
                    <span className="text-muted-foreground">Limitante</span>
                    <strong className="block text-foreground text-base">{LIMITING_FACTOR_COPY[out.limitingFactor]}</strong>
                  </div>
                  <div className="rounded bg-secondary/60 p-3">
                    <span className="text-muted-foreground">Entre turbinas</span>
                    <strong className="block text-foreground text-base">{out.distancia_entre_turbinas_km.toFixed(2)} km</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-5 panel-glow space-y-4">
            <div>
              <h2 className="text-sm font-bold tracking-[0.1em] text-muted-foreground uppercase">Exportação</h2>
              <p className="text-xs text-muted-foreground mt-1">Gere um resumo técnico para anexar em relatório ou salvar como evidência visual.</p>
            </div>
            <div className="flex flex-col sm:flex-row xl:flex-col gap-3">
              <button
                type="button"
                onClick={() => downloadSummaryPng(inputs, out)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Exportar PNG
              </button>
              <button
                type="button"
                onClick={() => printSummaryPdf(inputs, out)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-bold text-foreground hover:border-accent"
              >
                <FileText className="h-4 w-4" />
                Imprimir / salvar PDF
              </button>
            </div>
          </section>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 panel-glow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Renderização dos canvases</h2>
            <p className="text-xs text-muted-foreground">
              Os gráficos redesenham apenas quando parâmetros ou tamanho mudam. A animação dos rotores permanece opcional.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={animateCanvases}
              onChange={(event) => setAnimateCanvases(event.currentTarget.checked)}
              className="h-4 w-4 accent-accent"
            />
            Animar rotores
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FOVCanvas alpha={out.alpha} isVisible={out.isVisible} numTurbinas={inputs.num_turbinas} animate={animateCanvases} />
          <ProfileCanvas
            dist_km={inputs.dist_km}
            h_turbina={inputs.h_turbina}
            h_oculta={out.h_oculta}
            h_visivel={out.h_visivel}
            isVisible={out.isVisible}
            animate={animateCanvases}
          />
        </div>

        <VerticalFOVCanvas
          theta={out.theta}
          thetaAproximado={out.theta_aproximado}
          depressaoHorizonteDeg={out.depressao_horizonte_deg}
          alpha={out.alpha}
          largura_km={inputs.largura_km}
          numTurbinas={inputs.num_turbinas}
          distanciaEntreTurbinasKm={out.distancia_entre_turbinas_km}
          h_visivel={out.h_visivel}
          h_oculta={out.h_oculta}
          h_turbina={inputs.h_turbina}
          dist_km={inputs.dist_km}
          isVisible={out.isVisible}
          atmosphericTransmission={atmosphericTransmission}
          animate={animateCanvases}
        />

        <div className="bg-card border border-border rounded-lg p-6 panel-glow">
          <h2 className="text-sm font-bold tracking-[0.1em] text-muted-foreground uppercase mb-5">Parâmetros do cenário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <ControlSlider label="Distância até Costa" value={inputs.dist_km} min={1} max={200} step={0.5} unit="km" onChange={set("dist_km")} />
            <ControlSlider label="Largura do Parque" value={inputs.largura_km} min={0} max={100} step={0.5} unit="km" onChange={set("largura_km")} />
            <ControlSlider label="Número de Turbinas" value={inputs.num_turbinas} min={1} max={100} step={1} unit="un." onChange={set("num_turbinas")} />
            <ControlSlider label="Altura da Turbina" value={inputs.h_turbina} min={0} max={600} step={1} unit="m" onChange={set("h_turbina")} />
            <ControlSlider label="Elevação do Observador" value={inputs.h_obs} min={0} max={500} step={0.1} unit="m" onChange={set("h_obs")} />
            <ControlSlider label="Área Sólida Transversal" value={inputs.area} min={0} max={5000} step={10} unit="m²" onChange={set("area")} />
            <ControlSlider label="Contraste Inicial" value={inputs.ci} min={0} max={100} step={1} unit="%" onChange={set("ci")} />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground font-medium">Coeficiente de Refração (k)</label>
              <select
                value={inputs.k}
                onChange={(e) => set("k")(parseFloat(e.target.value))}
                className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value={1.00}>1.00 (Geometria Pura)</option>
                <option value={1.13}>1.13 (Padrão Software GIS)</option>
                <option value={1.17}>1.17 (Padrão NatureScot 2017)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground font-medium">Condição Atmosférica (β)</label>
              <select
                value={inputs.beta}
                onChange={(e) => set("beta")(parseFloat(e.target.value))}
                className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value={0}>Ar Perfeito</option>
                <option value={0.00004}>Ar Limpo</option>
                <option value={0.00008}>Névoa Leve</option>
                <option value={0.00012}>Névoa Densa</option>
              </select>
            </div>
          </div>
        </div>

        <TechnicalDocs />
      </div>
    </div>
  );
};

export default Index;
