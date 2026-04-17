import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const TechnicalDocs = () => (
  <div className="bg-card border border-border rounded-lg p-8 leading-relaxed panel-glow">
    <h2 className="text-2xl font-bold text-primary border-b border-border pb-3 mb-6">
      Memorial de Cálculo e Referências
    </h2>
    <p className="text-muted-foreground text-sm mb-6">
      O modelo matemático deste painel processa a intervisibilidade através de uma cascata lógica de três etapas: Topografia (eixo Z), Magnitude Paisagística (eixo X) e Dissolução Atmosférica (Opacidade).
    </p>

    <Section title="1. Filtragem Topográfica (Curvatura da Terra e Refração)">
      <p>Define o limite físico da linha de visão. Calcula a parcela da estrutura que desaparece atrás da curvatura do planeta.</p>
      <DocCard>
        <Math tex="d_{obs} = \sqrt{2 \cdot k \cdot R \cdot h_{obs}}" block />
        <Math tex="h_{oculta} = \frac{(d - d_{obs})^2}{2 \cdot R \cdot k}" block />
        <Math tex="h_{vis\acute{i}vel} = \max(0,\; h_{turbina} - h_{oculta})" block />
        <p className="text-xs text-muted-foreground mt-3">
          <strong className="text-foreground">Referência:</strong> NatureScot (2017). <em>Visual Representation of Wind Farms: Best Practice Guidance</em>.
        </p>
      </DocCard>
    </Section>

    <Section title="2. Magnitude Paisagística (Ocupação Angular SVIA)">
      <p>Se a estrutura desponta no horizonte (h_visível {'>'} 0), calcula-se a intrusão espacial geométrica no panorama de 180° do observador.</p>
      <DocCard>
        <Math tex="\alpha = 2 \cdot \arctan\!\left(\frac{W}{2d}\right) \cdot \frac{180}{\pi}" block />
        <Math tex="\theta = \arctan\!\left(\frac{h_{vis\acute{i}vel}}{d}\right) \cdot \frac{180}{\pi}" block />
        <p className="text-xs text-muted-foreground mt-3">
          <strong className="text-foreground">Referência:</strong> Manchado, C. et al. (2017). <em>Method to estimate the visual impact of an offshore wind farm</em>.
        </p>
      </DocCard>
    </Section>

    <Section title="3. Dissolução Atmosférica e Probabilidade Visual">
      <p>Calcula a degradação da luz pela névoa marinha e o limiar de detecção da retina humana (linear-logit).</p>
      <DocCard>
        <Math tex="S = M \cdot \left[\arctan\!\left(\frac{1}{d}\right) \cdot 60\right]^2" block />
        <Math tex="C_d = C_i \cdot e^{-\beta \cdot d}" block />
        <Math tex="Z_{ud} = -16{,}02 + 0{,}0124 \cdot (C_d \cdot S) + 12{,}75" block />
        <Math tex="P_{detec\c{c}\tilde{a}o} = \frac{1}{1 + e^{-Z_{ud}}} \times 100" block />
        <p className="text-xs text-muted-foreground mt-3">
          <strong className="text-foreground">Referência:</strong> Bishop, I. D. (2002). <em>Determination of thresholds of visual impact: the case of wind turbines</em>.
        </p>
      </DocCard>
    </Section>

    <Section title="4. Justificativa dos Parâmetros (k e β)">
      <DocCard accent="primary">
        <h4 className="font-bold text-foreground text-sm mb-2">Coeficiente de Refração Atmosférica (k)</h4>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
          <li><strong className="text-foreground">k = 1,00:</strong> Geometria pura (vácuo).</li>
          <li><strong className="text-foreground">k = 1,13:</strong> Padrão usado em softwares GIS (ESRI, QGIS) para análises ZTV.</li>
          <li><strong className="text-foreground">k = 1,17:</strong> Padrão NatureScot (2017) — recomendado para representação visual de parques eólicos.</li>
        </ul>
      </DocCard>
      <DocCard accent="accent">
        <h4 className="font-bold text-foreground text-sm mb-2">Coeficiente de Extinção Atmosférica (β)</h4>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
          <li><strong className="text-foreground">β = 0,00004:</strong> Ar limpo (~97 km vis.).</li>
          <li><strong className="text-foreground">β = 0,00008:</strong> Névoa leve (~48 km). Padrão Bishop (2002).</li>
          <li><strong className="text-foreground">β = 0,00012:</strong> Névoa densa (~32 km).</li>
        </ul>
      </DocCard>
    </Section>

    <Section title="5. Dicionário de Variáveis">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-foreground">Símbolo</th>
              <th className="text-left py-2 px-3 text-foreground">Unidade</th>
              <th className="text-left py-2 px-3 text-foreground">Descrição</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ["d", "m", "Distância até a costa"],
              ["h_{obs}", "m", "Elevação do observador"],
              ["h_{turbina}", "m", "Altura máxima da turbina"],
              ["R", "m", "Raio da Terra (6.371.000 m)"],
              ["k", "—", "Coeficiente de refração"],
              ["W", "m", "Largura do parque"],
              ["M", "m²", "Área transversal percebida (×1.2)"],
              ["C_i", "\\%", "Contraste inicial"],
              ["\\beta", "—", "Coeficiente de extinção atmosférica"],
              ["\\alpha / \\theta", "°", "Ângulos de abertura SVIA"],
            ].map(([sym, unit, desc], i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 px-3 font-bold text-accent"><Math tex={sym} /></td>
                <td className="py-2 px-3"><Math tex={unit} /></td>
                <td className="py-2 px-3">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
