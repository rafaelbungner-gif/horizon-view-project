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
const formatCentimeters = (valueMeters: number) => {
  const valueCm = valueMeters * 100;
  if (valueCm === 0) return "0,00 cm";
  if (Math.abs(valueCm) < 0.01) return `${valueCm.toExponential(2)} cm`;
  return `${valueCm.toFixed(2)} cm`;
};
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
  const verticalBandWidth = ratioWidth(out.gkeka_oh_m, GKEKA_HEIGHT_THRESHOLD_M);

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
        <div className="flex min-w-max flex-wrap items-center gap-x-8 gap-y-4 text-foreground">
          <MiniEquation>
            <SubVar symbol="H" sub="vis,G" /><Op>=</Op><Frac top={<Row><Num>0,5</Num><Text> m</Text></Row>} bottom={<Var>L</Var>} /><Op>×</Op><SubVar symbol="H" sub="vis,EVP" />
          </MiniEquation>
          <MiniEquation>
            <SubVar symbol="A" sub="vis,G" /><Op>=</Op>
            <Sup base={<Paren><Frac top={<Row><Num>0,5</Num><Text> m</Text></Row>} bottom={<Var>L</Var>} /></Paren>} exp={<Num>2</Num>} />
            <Op>×</Op><Var>A</Var><Op>×</Op><Frac top={<SubVar symbol="H" sub="vis,EVP" />} bottom={<Var>H</Var>} />
          </MiniEquation>
          <MiniEquation>
            <SubVar symbol="O" sub="H" /><Op>=</Op><Var>N</Var><Op>×</Op><SubVar symbol="H" sub="vis,G" /><Op>&lt;</Op><Row><Num>0,6</Num><Text> m</Text></Row>
          </MiniEquation>
          <MiniEquation>
            <SubVar symbol="O" sub="A" /><Op>=</Op><Var>N</Var><Op>×</Op><SubVar symbol="A" sub="vis,G" /><Op>&lt;</Op><Row><Num>0,0025</Num><Sup base={<Text> m</Text>} exp={<Num>2</Num>} /></Row>
          </MiniEquation>
        </div>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Faixa vertical no campo de visão
            </span>
            <strong className="block mt-1 text-2xl font-mono text-foreground">
              {formatCentimeters(out.gkeka_hvis_por_turbina_m)} por turbina
            </strong>
          </div>
          <div className="text-xs text-muted-foreground md:text-right">
            <span className="block">O_H agregado: <strong className="text-foreground">{formatCentimeters(out.gkeka_oh_m)}</strong></span>
            <span className="block">Limiar Gkeka: {formatCentimeters(GKEKA_HEIGHT_THRESHOLD_M)}</span>
          </div>
        </div>
        <div className="mt-3 h-3 rounded-full bg-background overflow-hidden border border-border/70">
          <div className={out.gkeka_altura_ok ? "h-full bg-success" : "h-full bg-destructive"} style={{ width: verticalBandWidth }} />
        </div>
        <p className="mt-2 text-[0.7rem] text-muted-foreground">
          Leitura em centímetros no plano visual de 50 cm: a primeira medida é a altura aparente de uma turbina; o O_H agregado é a soma projetiva usada pelo critério Gkeka para {inputs.num_turbinas} turbinas.
        </p>
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

const MiniEquation = ({ children }: { children: ReactNode }) => (
  <math className="formula-math inline-block text-xl leading-relaxed" style={mathStyle}>
    <mrow>{children}</mrow>
  </math>
);

const Var = ({ children }: { children: ReactNode }) => <mi>{children}</mi>;
const Num = ({ children }: { children: ReactNode }) => <mn>{children}</mn>;
const Op = ({ children }: { children: ReactNode }) => <mo>{children}</mo>;
const Text = ({ children }: { children: ReactNode }) => <mtext>{children}</mtext>;
const Row = ({ children }: { children: ReactNode }) => <mrow>{children}</mrow>;

const SubVar = ({ symbol, sub }: { symbol: string; sub: string }) => (
  <msub>
    <mi>{symbol}</mi>
    <mtext>{sub}</mtext>
  </msub>
);

const Sup = ({ base, exp }: { base: ReactNode; exp: ReactNode }) => (
  <msup>
    <mrow>{base}</mrow>
    <mrow>{exp}</mrow>
  </msup>
);

const Frac = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <mfrac>
    <mrow>{top}</mrow>
    <mrow>{bottom}</mrow>
  </mfrac>
);

const Paren = ({ children }: { children: ReactNode }) => <mrow><mo>(</mo>{children}<mo>)</mo></mrow>;

export default GkekaAssessment;
