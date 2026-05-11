import type { CSSProperties, ReactNode } from "react";
import {
  GKEKA_AREA_THRESHOLD_M2,
  GKEKA_HEIGHT_THRESHOLD_M,
  GKEKA_REFERENCE_PLANE_DISTANCE_M,
  type CalcInputs,
  type CalcOutputs,
} from "@/lib/calculations";

interface GkekaAssessmentProps {
  inputs: CalcInputs;
  out: CalcOutputs;
}

const mathStyle: CSSProperties = {
  fontFamily: '"Cambria Math", Cambria, "Times New Roman", serif',
};

const formatMeters = (value: number) => `${value.toFixed(4)} m`;
const formatArea = (value: number) => {
  if (value === 0) return "0 m²";
  if (Math.abs(value) < 0.001) return `${value.toExponential(2)} m²`;
  return `${value.toFixed(4)} m²`;
};

const limitClass = (ok: boolean) => ok
  ? "border-success/40 bg-success/10 text-success"
  : "border-destructive/40 bg-destructive/10 text-destructive";

const ratioWidth = (value: number, threshold: number) => `${Math.min((value / threshold) * 100, 100).toFixed(1)}%`;

const GkekaAssessment = ({ inputs, out }: GkekaAssessmentProps) => {
  const statusLabel = out.gkeka_limites_atendidos ? "Dentro dos limiares" : "Acima dos limiares";

  return (
    <section className="bg-card border border-border rounded-lg p-5 panel-glow space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-[0.1em] text-muted-foreground uppercase">
            Análise Gkeka-Serpetsidaki et al. (2022)
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-4xl">
            Funcionalidade: projeta a altura e a superfície visível da turbina em um plano de referência de {GKEKA_REFERENCE_PLANE_DISTANCE_M.toFixed(1)} m, soma o efeito para todas as turbinas e compara com os limiares O_H &lt; 0,6 m e O_A &lt; 0,0025 m² propostos no estudo. Nesta adaptação, usamos a parcela geometricamente visível calculada pelo simulador.
          </p>
        </div>
        <span className={`inline-flex self-start rounded-full border px-3 py-1.5 text-[0.68rem] font-bold uppercase ${limitClass(out.gkeka_limites_atendidos)}`}>
          {statusLabel}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-background/35 p-4 overflow-x-auto">
        <div className="flex min-w-max flex-wrap items-center gap-x-6 gap-y-3 text-lg text-foreground" style={mathStyle}>
          <MiniFormula>
            <Var>H<Sub>vis</Sub></Var><span>=</span><MiniFrac top="0,5 m" bottom="L" /><span>×</span><Var>H</Var>
          </MiniFormula>
          <MiniFormula>
            <Var>A<Sub>vis</Sub></Var><span>=</span><Group>(<MiniFrac top="0,5 m" bottom="L" />)</Group><Sup>2</Sup><span>×</span><Var>A</Var>
          </MiniFormula>
          <MiniFormula>
            <Var>O<Sub>H</Sub></Var><span>&lt;</span><span>0,6 m</span>
          </MiniFormula>
          <MiniFormula>
            <Var>O<Sub>A</Sub></Var><span>&lt;</span><span>0,0025 m<Sup>2</Sup></span>
          </MiniFormula>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
        <ProjectionCard
          label="H_vis por turbina"
          value={formatMeters(out.gkeka_hvis_por_turbina_m)}
          detail="Altura projetada individual"
        />
        <ProjectionCard
          label="A_vis por turbina"
          value={formatArea(out.gkeka_avis_por_turbina_m2)}
          detail="Área projetada individual"
        />
        <LimitCard
          label="O_H agregado"
          value={formatMeters(out.gkeka_oh_m)}
          threshold={`limite ${formatMeters(GKEKA_HEIGHT_THRESHOLD_M)}`}
          ok={out.gkeka_altura_ok}
          width={ratioWidth(out.gkeka_oh_m, GKEKA_HEIGHT_THRESHOLD_M)}
        />
        <LimitCard
          label="O_A agregado"
          value={formatArea(out.gkeka_oa_m2)}
          threshold={`limite ${formatArea(GKEKA_AREA_THRESHOLD_M2)}`}
          ok={out.gkeka_area_ok}
          width={ratioWidth(out.gkeka_oa_m2, GKEKA_AREA_THRESHOLD_M2)}
        />
      </div>

      <p className="text-[0.7rem] text-muted-foreground">
        Leitura: quanto maiores O_H e O_A, maior a perturbação visual projetada pelo método. O cálculo usa {inputs.num_turbinas} turbinas, distância de {inputs.dist_km.toFixed(1)} km e área visível proporcional à fração da turbina acima do horizonte.
      </p>
    </section>
  );
};

const ProjectionCard = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="rounded-lg border border-border bg-secondary/40 p-4">
    <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
    <strong className="block mt-2 text-xl font-mono text-foreground">{value}</strong>
    <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
  </div>
);

const LimitCard = ({ label, value, threshold, ok, width }: { label: string; value: string; threshold: string; ok: boolean; width: string }) => (
  <div className="rounded-lg border border-border bg-secondary/40 p-4">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-bold uppercase ${limitClass(ok)}`}>
        {ok ? "OK" : "Atenção"}
      </span>
    </div>
    <strong className="block mt-2 text-xl font-mono text-foreground">{value}</strong>
    <div className="mt-3 h-2 rounded-full bg-background overflow-hidden">
      <div className={ok ? "h-full bg-success" : "h-full bg-destructive"} style={{ width }} />
    </div>
    <span className="mt-1 block text-xs text-muted-foreground">{threshold}</span>
  </div>
);

const MiniFormula = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
);

const MiniFrac = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <span className="inline-flex flex-col items-center justify-center align-middle text-center text-[0.95em] leading-none">
    <span className="border-b border-current px-1 pb-0.5">{top}</span>
    <span className="px-1 pt-0.5">{bottom}</span>
  </span>
);

const Var = ({ children }: { children: ReactNode }) => <span className="italic">{children}</span>;
const Group = ({ children }: { children: ReactNode }) => <span className="inline-flex items-center gap-1">{children}</span>;
const Sub = ({ children }: { children: ReactNode }) => <sub className="text-[0.62em] leading-none">{children}</sub>;
const Sup = ({ children }: { children: ReactNode }) => <sup className="text-[0.62em] leading-none">{children}</sup>;

export default GkekaAssessment;
