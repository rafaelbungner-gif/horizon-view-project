import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const TechnicalDocs = () => (
  <div className="bg-card border border-border rounded-lg p-8 leading-relaxed panel-glow">
    <h2 className="text-2xl font-bold text-primary border-b border-border pb-3 mb-6">
      Memorial de Cálculo e Referências
    </h2>
    <p className="text-muted-foreground text-sm mb-6">
      O painel combina curvatura terrestre, refração atmosférica, atenuação de contraste e uma leitura angular corrigida pela depressão do horizonte quando o observador está elevado.
    </p>

    <Section title="1. Curvatura da Terra e refração">
      <p>O raio efetivo resume a refração atmosférica em um único fator <Math tex="k" />. A altura oculta só passa a crescer quando o alvo está além do horizonte do observador.</p>
      <DocCard>
        <Math tex="R_{efetivo} = R \cdot k" block />
        <Math tex="d_{obs} = \sqrt{2 \cdot R_{efetivo} \cdot h_{obs}}" block />
        <Math tex="h_{oculta} = \frac{\max(0,\;d-d_{obs})^2}{2 \cdot R_{efetivo}}" block />
        <Math tex="h_{visivel} = \max(0,\; h_{turbina} - h_{oculta})" block />
      </DocCard>
    </Section>

    <Section title="2. Ocupação angular e depressão do horizonte">
      <p>O valor <Math tex="\theta_{geom}" /> mede a abertura angular da porção visível. Quando a turbina está além do horizonte do observador, o painel soma a depressão do horizonte para representar melhor a posição angular real no campo de visão.</p>
      <DocCard>
        <Math tex="\alpha = 2 \cdot \arctan\!\left(\frac{W}{2d}\right) \cdot \frac{180}{\pi}" block />
        <Math tex="\theta_{geom} = \arctan\!\left(\frac{h_{visivel}}{d}\right) \cdot \frac{180}{\pi}" block />
        <Math tex="\delta_h = \arctan\!\left(\frac{d_{obs}}{2R_{efetivo}}\right) \cdot \frac{180}{\pi}" block />
        <Math tex="\theta_{real} = \theta_{geom} + \delta_h" block />
        <p className="text-xs text-muted-foreground mt-3">
          A correção <Math tex="\delta_h" /> é aplicada apenas quando <Math tex="d > d_{obs}" /> e há altura visível.
        </p>
      </DocCard>
    </Section>

    <Section title="3. Atmosfera, contraste e alcance visual">
      <p>O contraste remanescente segue um decaimento exponencial. Se o contraste inicial já estiver abaixo de 2%, o limite atmosférico é zero e a interface mostra o alvo como já invisível.</p>
      <DocCard>
        <Math tex="C_d = C_i \cdot e^{-\beta \cdot d}" block />
        <Math tex="d_{limiar} = \frac{\ln(C_i/2)}{\beta}" block />
        <p className="text-xs text-muted-foreground mt-3">
          Para <Math tex="\beta = 0" />, o alcance atmosférico é ilimitado. Para <Math tex="C_i < 2\%" />, o alcance atmosférico é <Math tex="0" />.
        </p>
      </DocCard>
    </Section>

    <Section title="4. Probabilidade visual inspirada em Bishop (2002)">
      <p>O código usa o modelo logístico univariado equivalente ao intercepto consolidado <Math tex="-3{,}27" />, evitando somar simultaneamente constantes de tabelas diferentes.</p>
      <DocCard>
        <Math tex="M = area \cdot 1{,}2" block />
        <Math tex="S = M \cdot \left[\arctan\!\left(\frac{1}{d}\right) \cdot \frac{180}{\pi} \cdot 60\right]^2" block />
        <Math tex="Z = -3{,}27 + 0{,}0124 \cdot (C_d \cdot S)" block />
        <Math tex="P_{deteccao} = \frac{1}{1 + e^{-Z}} \times 100" block />
      </DocCard>
    </Section>

    <Section title="5. Parâmetros de referência">
      <div className="grid gap-4 md:grid-cols-2">
        <DocCard accent="primary">
          <h4 className="font-bold text-foreground text-sm mb-2">Coeficiente de refração (k)</h4>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
            <li><strong className="text-foreground">k = 1,00:</strong> geometria pura.</li>
            <li><strong className="text-foreground">k = 1,13:</strong> aproximação comum em análises GIS/ZTV.</li>
            <li><strong className="text-foreground">k = 1,17:</strong> aproximação usada em diretrizes de visualização de parques eólicos.</li>
          </ul>
        </DocCard>
        <DocCard accent="accent">
          <h4 className="font-bold text-foreground text-sm mb-2">Coeficiente de extinção (β)</h4>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
            <li><strong className="text-foreground">β = 0,00004:</strong> ar limpo.</li>
            <li><strong className="text-foreground">β = 0,00008:</strong> névoa leve.</li>
            <li><strong className="text-foreground">β = 0,00012:</strong> névoa densa.</li>
          </ul>
        </DocCard>
      </div>
    </Section>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-accent mb-3">{title}</h3>
    <div className="text-sm text-muted-foreground space-y-3">{children}</div>
  </div>
);

const DocCard = ({ children, accent = "accent" }: { children: React.ReactNode; accent?: string }) => (
  <div className={`bg-secondary/50 border-l-4 ${accent === "primary" ? "border-l-primary" : "border-l-accent"} p-4 rounded-r-lg`}>
    {children}
  </div>
);

const Math = ({ tex, block }: { tex: string; block?: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, {
        throwOnError: false,
        displayMode: !!block,
      });
    }
  }, [tex, block]);

  if (block) {
    return (
      <div className="bg-background/50 px-4 py-2 rounded my-2 overflow-x-auto">
        <span ref={ref} />
      </div>
    );
  }
  return <span ref={ref} />;
};

export default TechnicalDocs;
