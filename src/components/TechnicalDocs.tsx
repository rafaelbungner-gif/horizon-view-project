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
        <Formula>{`d_obs = √(2 · k · R · h_obs)`}</Formula>
        <Formula>{`h_oculta = (d - d_obs)² / (2 · R · k)`}</Formula>
        <Formula>{`h_visível = max(0, h_turbina - h_oculta)`}</Formula>
        <p className="text-xs text-muted-foreground mt-3">
          <strong className="text-foreground">Referência:</strong> NatureScot (2017). <em>Visual Representation of Wind Farms: Best Practice Guidance</em>.
        </p>
      </DocCard>
    </Section>

    <Section title="2. Magnitude Paisagística (Ocupação Angular SVIA)">
      <p>Se a estrutura desponta no horizonte (h_visível {'>'} 0), calcula-se a intrusão espacial geométrica no panorama de 180° do observador.</p>
      <DocCard>
        <Formula>{`α = 2 · arctan(W / (2 · d)) · (180/π)`}</Formula>
        <Formula>{`θ = arctan(h_visível / d) · (180/π)`}</Formula>
        <p className="text-xs text-muted-foreground mt-3">
          <strong className="text-foreground">Referência:</strong> Manchado, C. et al. (2017). <em>Method to estimate the visual impact of an offshore wind farm</em>.
        </p>
      </DocCard>
    </Section>

    <Section title="3. Dissolução Atmosférica e Probabilidade Visual">
      <p>Calcula a degradação da luz pela névoa marinha e o limiar de detecção da retina humana (linear-logit).</p>
      <DocCard>
        <Formula>{`S = M · [arctan(1/d) · 60]²`}</Formula>
        <Formula>{`C_d = C_i · exp(-β · d)`}</Formula>
        <Formula>{`Z_ud = -16.02 + 0.0124·(C_d · S) + 12.75`}</Formula>
        <Formula>{`P_detecção = 1 / (1 + exp(-Z_ud)) · 100`}</Formula>
        <p className="text-xs text-muted-foreground mt-3">
          <strong className="text-foreground">Referência:</strong> Bishop, I. D. (2002). <em>Determination of thresholds of visual impact: the case of wind turbines</em>.
        </p>
      </DocCard>
    </Section>

    <Section title="4. Justificativa dos Parâmetros (k e β)">
      <DocCard accent="primary">
        <h4 className="font-bold text-foreground text-sm mb-2">Coeficiente de Refração Atmosférica (k)</h4>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
          <li><strong className="text-foreground">k = 1.00:</strong> Geometria pura (vácuo).</li>
          <li><strong className="text-foreground">k = 1.13:</strong> Padrão NatureScot (2017) para mapas ZTV.</li>
        </ul>
      </DocCard>
      <DocCard accent="accent">
        <h4 className="font-bold text-foreground text-sm mb-2">Coeficiente de Extinção Atmosférica (β)</h4>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
          <li><strong className="text-foreground">β = 0.00004:</strong> Ar limpo (~97 km vis.).</li>
          <li><strong className="text-foreground">β = 0.00008:</strong> Névoa leve (~48 km). Padrão Bishop (2002).</li>
          <li><strong className="text-foreground">β = 0.00012:</strong> Névoa densa (~32 km).</li>
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
              ["h_obs", "m", "Elevação do observador"],
              ["h_turbina", "m", "Altura máxima da turbina"],
              ["R", "m", "Raio da Terra (6.371.000 m)"],
              ["k", "—", "Coeficiente de refração"],
              ["W", "m", "Largura do parque"],
              ["M", "m²", "Área transversal percebida (×1.2)"],
              ["C_i", "%", "Contraste inicial"],
              ["β", "—", "Coeficiente de extinção atmosférica"],
              ["α / θ", "°", "Ângulos de abertura SVIA"],
            ].map(([sym, unit, desc], i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 px-3 font-mono font-bold text-accent">{sym}</td>
                <td className="py-2 px-3">{unit}</td>
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

const Formula = ({ children }: { children: string }) => (
  <div className="font-mono text-sm text-warning bg-background/50 px-3 py-1.5 rounded my-1">
    {children}
  </div>
);

export default TechnicalDocs;
