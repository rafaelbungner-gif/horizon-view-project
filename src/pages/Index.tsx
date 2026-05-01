import { useMemo, useState } from "react";
import { Wind } from "lucide-react";
import { calculate, type CalcInputs } from "@/lib/calculations";
import MetricCard from "@/components/MetricCard";
import ControlSlider from "@/components/ControlSlider";
import FOVCanvas from "@/components/FOVCanvas";
import ProfileCanvas from "@/components/ProfileCanvas";
import VerticalFOVCanvas from "@/components/VerticalFOVCanvas";
import TechnicalDocs from "@/components/TechnicalDocs";

const Index = () => {
  const [inputs, setInputs] = useState<CalcInputs>({
    dist_km: 15,
    h_turbina: 260,
    h_obs: 2,
    largura_km: 10,
    area: 1500,
    ci: 35,
    k: 1.13,
    beta: 0.00008,
  });
  const [animateCanvases, setAnimateCanvases] = useState(false);

  const set = (key: keyof CalcInputs) => (v: number) =>
    setInputs((prev) => ({ ...prev, [key]: v }));

  const out = useMemo(() => calculate(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-[1500px] space-y-6">
        <header className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 panel-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wind className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Impacto Visual: Eólicas Offshore</h1>
              <p className="text-xs text-muted-foreground">Dashboard Unificado de Visibilidade</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricCard label="Oculto (m)" value={out.h_oculta.toFixed(1)} color="destructive" />
            <MetricCard label="Visível (m)" value={out.h_visivel.toFixed(1)} color={out.h_visivel > 0 ? "success" : "destructive"} />
            <MetricCard label="Ocup. Horizontal" value={`${out.alpha.toFixed(2)}°`} color="accent" />
            <MetricCard label="Ocup. Vertical" value={`${out.theta.toFixed(3)}°`} color="accent" />
            <MetricCard label="Prob. Detecção" value={out.isVisible ? `${out.prob_pct.toFixed(1)}%` : "0.0%"} color={out.isVisible ? "accent" : "destructive"} />
          </div>
        </header>

        <div className="bg-card border border-border rounded-lg p-4 panel-glow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Renderização dos canvases</h2>
            <p className="text-xs text-muted-foreground">
              Por padrão, os gráficos redesenham apenas quando os parâmetros mudam. Ligue a animação somente quando quiser ver os rotores girando.
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
          <FOVCanvas alpha={out.alpha} isVisible={out.isVisible} animate={animateCanvases} />
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
          alpha={out.alpha}
          largura_km={inputs.largura_km}
          h_visivel={out.h_visivel}
          h_oculta={out.h_oculta}
          h_turbina={inputs.h_turbina}
          dist_km={inputs.dist_km}
          isVisible={out.isVisible}
          animate={animateCanvases}
        />

        <div className="bg-card border border-border rounded-lg p-6 panel-glow">
          <h2 className="text-sm font-bold tracking-[0.1em] text-muted-foreground uppercase mb-5">Parâmetros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <ControlSlider label="Distância até Costa" value={inputs.dist_km} min={1} max={200} step={0.5} unit="km" onChange={set("dist_km")} />
            <ControlSlider label="Largura do Parque" value={inputs.largura_km} min={0} max={100} step={0.5} unit="km" onChange={set("largura_km")} />
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
