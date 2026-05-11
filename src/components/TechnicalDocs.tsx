import type { CSSProperties, ReactNode } from "react";

const mathStyle: CSSProperties = {
  fontFamily: '"Cambria Math", Cambria, "Times New Roman", serif',
};

const TechnicalDocs = () => (
  <div className="bg-card border border-border rounded-lg p-8 leading-relaxed panel-glow">
    <h2 className="text-2xl font-bold text-primary border-b border-border pb-3 mb-6">
      Memorial de Cálculo e Referências
    </h2>
    <p className="text-muted-foreground text-sm mb-6">
      O painel combina curvatura terrestre, refração atmosférica, atenuação de contraste, leitura angular corrigida, espaçamento médio entre turbinas e uma análise de perturbação visual baseada em Gkeka-Serpetsidaki, Papadopoulos e Tsoutsos (2022).
    </p>

    <Section title="1. Curvatura da Terra e refração">
      <p>O raio efetivo resume a refração atmosférica em um único fator <InlineFormula>k</InlineFormula>. A altura oculta só passa a crescer quando o alvo está além do horizonte do observador.</p>
      <DocCard>
        <Equation>
          <Var>R<Sub>efetivo</Sub></Var><Op>=</Op><Var>R<Sub>terra</Sub></Var><Op>×</Op><Var>k</Var>
        </Equation>
        <Equation>
          <Var>d<Sub>obs</Sub></Var><Op>=</Op><Sqrt>2 <Op>×</Op> <Var>R<Sub>efetivo</Sub></Var> <Op>×</Op> <Var>h<Sub>obs</Sub></Var></Sqrt>
        </Equation>
        <Equation>
          <Var>h<Sub>oculta</Sub></Var><Op>=</Op><Frac top={<><Fn>max</Fn>(0, <Var>d</Var> − <Var>d<Sub>obs</Sub></Var>)<Sup>2</Sup></>} bottom={<>2 <Op>×</Op> <Var>R<Sub>efetivo</Sub></Var></>} />
        </Equation>
        <Equation>
          <Var>h<Sub>visível</Sub></Var><Op>=</Op><Fn>max</Fn>(0, <Var>h<Sub>turbina</Sub></Var> − <Var>h<Sub>oculta</Sub></Var>)
        </Equation>
      </DocCard>
    </Section>

    <Section title="2. Ocupação angular e depressão do horizonte">
      <p>O valor <InlineFormula>θ<Sub>geom</Sub></InlineFormula> mede a abertura angular da porção visível. Quando a turbina está além do horizonte do observador, o painel soma a depressão do horizonte para representar melhor a posição angular real no campo de visão.</p>
      <DocCard>
        <Equation>
          <Var>α</Var><Op>=</Op>2 <Op>×</Op> <Fn>arctan</Fn><Group><Frac top="W" bottom="2d" /></Group> <Op>×</Op> <Frac top="180" bottom="π" />
        </Equation>
        <Equation>
          <Var>θ<Sub>geom</Sub></Var><Op>=</Op><Fn>arctan</Fn><Group><Frac top={<Var>h<Sub>visível</Sub></Var>} bottom="d" /></Group> <Op>×</Op> <Frac top="180" bottom="π" />
        </Equation>
        <Equation>
          <Var>δ<Sub>h</Sub></Var><Op>=</Op><Fn>arctan</Fn><Group><Frac top={<Var>d<Sub>obs</Sub></Var>} bottom={<><span>2</span><Var>R<Sub>efetivo</Sub></Var></>} /></Group> <Op>×</Op> <Frac top="180" bottom="π" />
        </Equation>
        <Equation>
          <Var>θ<Sub>real</Sub></Var><Op>=</Op><Var>θ<Sub>geom</Sub></Var><Op>+</Op><Var>δ<Sub>h</Sub></Var>
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          A correção <InlineFormula>δ<Sub>h</Sub></InlineFormula> é aplicada apenas quando <InlineFormula>d &gt; d<Sub>obs</Sub></InlineFormula> e há altura visível.
        </p>
      </DocCard>
    </Section>

    <Section title="3. Distância entre turbinas">
      <p>O campo de quantidade de turbinas calcula o espaçamento médio linear ao longo da largura informada do parque. O resultado é exibido no cabeçalho, no diagnóstico e nos resumos exportados.</p>
      <DocCard>
        <Equation>
          <Var>s</Var><Op>=</Op><Frac top="W" bottom={<><Var>N</Var> − 1</>} /><span className="mx-3 text-muted-foreground">para</span><Var>N</Var> &gt; 1
        </Equation>
        <Equation>
          <Var>s</Var><Op>=</Op>0<span className="mx-3 text-muted-foreground">para</span><Var>N</Var> = 1
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          O cálculo usa <InlineFormula>W</InlineFormula> como largura do parque em quilômetros e <InlineFormula>N</InlineFormula> como número de turbinas. Ele não substitui um layout executivo com múltiplas fileiras, espaçamentos irregulares ou exclusões locais.
        </p>
      </DocCard>
    </Section>

    <Section title="4. Análise Gkeka-Serpetsidaki et al. (2022)">
      <p>Esta funcionalidade estima a perturbação visual por projeção: a altura e a superfície visível da turbina são projetadas em um plano de referência de 0,5 m e somadas para todas as turbinas do cenário.</p>
      <DocCard>
        <Equation>
          <Var>H<Sub>vis,G</Sub></Var><Op>=</Op><Frac top="0,5 m" bottom="L" /><Op>×</Op><Var>H<Sub>vis,EVP</Sub></Var>
        </Equation>
        <Equation>
          <Var>A<Sub>vis,G</Sub></Var><Op>=</Op><Group><Frac top="0,5 m" bottom="L" /></Group><Sup>2</Sup><Op>×</Op><Var>A</Var><Op>×</Op><Frac top={<Var>H<Sub>vis,EVP</Sub></Var>} bottom="H" />
        </Equation>
        <Equation>
          <Var>O<Sub>H</Sub></Var><Op>=</Op><Var>N</Var><Op>×</Op><Var>H<Sub>vis,G</Sub></Var><span className="mx-4 text-muted-foreground">;</span><Var>O<Sub>A</Sub></Var><Op>=</Op><Var>N</Var><Op>×</Op><Var>A<Sub>vis,G</Sub></Var>
        </Equation>
        <Equation>
          <Var>O<Sub>H</Sub></Var> &lt; 0,6 m<span className="mx-4 text-muted-foreground">;</span><Var>O<Sub>A</Sub></Var> &lt; 0,0025 m<Sup>2</Sup>
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          Adaptação usada no simulador: <InlineFormula>H<Sub>vis,EVP</Sub></InlineFormula> é a parcela da turbina acima do horizonte já corrigida por curvatura/refração, e a área entra proporcionalmente a essa fração visível. A métrica não considera atenuação atmosférica, cor, fundo visual ou percepção social; ela funciona como um segundo critério geométrico de triagem.
        </p>
      </DocCard>
    </Section>

    <Section title="5. Atmosfera, contraste e alcance visual">
      <p>O contraste remanescente segue um decaimento exponencial. Se o contraste inicial já estiver abaixo de 2%, o limite atmosférico é zero e a interface mostra o alvo como já invisível.</p>
      <DocCard>
        <Equation>
          <Var>C<Sub>d</Sub></Var><Op>=</Op><Var>C<Sub>i</Sub></Var><Op>×</Op><Var>e</Var><Sup>−β × d</Sup>
        </Equation>
        <Equation>
          <Var>d<Sub>limiar</Sub></Var><Op>=</Op><Frac top={<><Fn>ln</Fn>(<Var>C<Sub>i</Sub></Var> / 2)</>} bottom="β" />
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          Para <InlineFormula>β = 0</InlineFormula>, o alcance atmosférico é ilimitado. Para <InlineFormula>C<Sub>i</Sub> &lt; 2%</InlineFormula>, o alcance atmosférico é <InlineFormula>0</InlineFormula>. A camada visual de névoa foi removida do campo periférico e do perfil lateral, mantendo a atmosfera como cálculo e diagnóstico.
        </p>
      </DocCard>
    </Section>

    <Section title="6. Probabilidade visual inspirada em Bishop (2002)">
      <p>O código usa o modelo logístico univariado equivalente ao intercepto consolidado <InlineFormula>−3,27</InlineFormula>, evitando somar simultaneamente constantes de tabelas diferentes.</p>
      <DocCard>
        <Equation>
          <Var>M</Var><Op>=</Op><Var>area</Var><Op>×</Op>1,2
        </Equation>
        <Equation>
          <Var>S</Var><Op>=</Op><Var>M</Var><Op>×</Op><Group>[<Fn>arctan</Fn><Group><Frac top="1" bottom="d" /></Group><Op>×</Op><Frac top="180" bottom="π" /><Op>×</Op>60]</Group><Sup>2</Sup>
        </Equation>
        <Equation>
          <Var>Z</Var><Op>=</Op>−3,27 <Op>+</Op> 0,0124 <Op>×</Op> <Group>(<Var>C<Sub>d</Sub></Var><Op>×</Op><Var>S</Var>)</Group>
        </Equation>
        <Equation>
          <Var>P<Sub>detecção</Sub></Var><Op>=</Op><Frac top="1" bottom={<><span>1</span> <Op>+</Op> <Var>e</Var><Sup>−Z</Sup></>} /><Op>×</Op>100
        </Equation>
      </DocCard>
    </Section>

    <Section title="7. Parâmetros de referência">
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

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-accent mb-3">{title}</h3>
    <div className="text-sm text-muted-foreground space-y-3">{children}</div>
  </div>
);

const DocCard = ({ children, accent = "accent" }: { children: ReactNode; accent?: string }) => (
  <div className={`bg-secondary/50 border-l-4 ${accent === "primary" ? "border-l-primary" : "border-l-accent"} p-4 rounded-r-lg`}>
    {children}
  </div>
);

const Equation = ({ children }: { children: ReactNode }) => (
  <div className="bg-background/50 px-4 py-3 rounded my-2 overflow-x-auto">
    <div
      className="inline-flex min-w-max items-center justify-center gap-2 text-xl text-foreground leading-none"
      style={mathStyle}
    >
      {children}
    </div>
  </div>
);

const InlineFormula = ({ children }: { children: ReactNode }) => (
  <span className="text-foreground whitespace-nowrap" style={mathStyle}>{children}</span>
);

const Var = ({ children }: { children: ReactNode }) => <span className="italic">{children}</span>;
const Fn = ({ children }: { children: ReactNode }) => <span className="not-italic">{children}</span>;
const Op = ({ children }: { children: ReactNode }) => <span className="px-0.5">{children}</span>;
const Group = ({ children }: { children: ReactNode }) => <span className="inline-flex items-center gap-1">{children}</span>;
const Sub = ({ children }: { children: ReactNode }) => <sub className="text-[0.62em] leading-none">{children}</sub>;
const Sup = ({ children }: { children: ReactNode }) => <sup className="text-[0.62em] leading-none">{children}</sup>;

const Frac = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <span className="mx-1 inline-flex flex-col items-center justify-center align-middle text-center leading-none">
    <span className="border-b border-current px-1 pb-0.5">{top}</span>
    <span className="px-1 pt-0.5">{bottom}</span>
  </span>
);

const Sqrt = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-start align-middle">
    <span className="text-2xl leading-none">√</span>
    <span className="border-t border-current px-1 pt-0.5">{children}</span>
  </span>
);

export default TechnicalDocs;
