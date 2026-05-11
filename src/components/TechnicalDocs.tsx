import type { CSSProperties, ReactNode } from "react";

const mathStyle: CSSProperties = {
  fontFamily: '"Cambria Math", Cambria, "Times New Roman", serif',
};

const blockMathStyle: CSSProperties = {
  ...mathStyle,
  display: "block",
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
      <p>O raio efetivo resume a refração atmosférica em um único fator <InlineFormula><Var>k</Var></InlineFormula>. A altura oculta só passa a crescer quando o alvo está além do horizonte do observador.</p>
      <DocCard>
        <Equation>
          <SubVar symbol="R" sub="efetivo" /><Op>=</Op><SubVar symbol="R" sub="terra" /><Op>×</Op><Var>k</Var>
        </Equation>
        <Equation>
          <SubVar symbol="d" sub="obs" /><Op>=</Op>
          <Sqrt>
            <Num>2</Num><Op>×</Op><SubVar symbol="R" sub="efetivo" /><Op>×</Op><SubVar symbol="h" sub="obs" />
          </Sqrt>
        </Equation>
        <Equation>
          <SubVar symbol="h" sub="oculta" /><Op>=</Op>
          <Frac
            top={<Sup base={<Paren><Fn>max</Fn><Fence><Num>0</Num><Op>,</Op><Var>d</Var><Op>−</Op><SubVar symbol="d" sub="obs" /></Fence></Paren>} exp={<Num>2</Num>} />}
            bottom={<Row><Num>2</Num><Op>×</Op><SubVar symbol="R" sub="efetivo" /></Row>}
          />
        </Equation>
        <Equation>
          <SubVar symbol="h" sub="visível" /><Op>=</Op><Fn>max</Fn><Fence><Num>0</Num><Op>,</Op><SubVar symbol="h" sub="turbina" /><Op>−</Op><SubVar symbol="h" sub="oculta" /></Fence>
        </Equation>
      </DocCard>
    </Section>

    <Section title="2. Ocupação angular e depressão do horizonte">
      <p>O valor <InlineFormula><SubVar symbol="θ" sub="geom" /></InlineFormula> mede a abertura angular da porção visível. Quando a turbina está além do horizonte do observador, o painel soma a depressão do horizonte para representar melhor a posição angular real no campo de visão.</p>
      <DocCard>
        <Equation>
          <Var>α</Var><Op>=</Op><Num>2</Num><Op>×</Op><Fn>arctan</Fn>
          <Fence><Frac top={<Var>W</Var>} bottom={<Row><Num>2</Num><Var>d</Var></Row>} /></Fence>
          <Op>×</Op><Frac top={<Num>180</Num>} bottom={<Var>π</Var>} />
        </Equation>
        <Equation>
          <SubVar symbol="θ" sub="geom" /><Op>=</Op><Fn>arctan</Fn>
          <Fence><Frac top={<SubVar symbol="h" sub="visível" />} bottom={<Var>d</Var>} /></Fence>
          <Op>×</Op><Frac top={<Num>180</Num>} bottom={<Var>π</Var>} />
        </Equation>
        <Equation>
          <SubVar symbol="δ" sub="h" /><Op>=</Op><Fn>arctan</Fn>
          <Fence><Frac top={<SubVar symbol="d" sub="obs" />} bottom={<Row><Num>2</Num><SubVar symbol="R" sub="efetivo" /></Row>} /></Fence>
          <Op>×</Op><Frac top={<Num>180</Num>} bottom={<Var>π</Var>} />
        </Equation>
        <Equation>
          <SubVar symbol="θ" sub="real" /><Op>=</Op><SubVar symbol="θ" sub="geom" /><Op>+</Op><SubVar symbol="δ" sub="h" />
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          A correção <InlineFormula><SubVar symbol="δ" sub="h" /></InlineFormula> é aplicada apenas quando <InlineFormula><Var>d</Var><Op>&gt;</Op><SubVar symbol="d" sub="obs" /></InlineFormula> e há altura visível.
        </p>
      </DocCard>
    </Section>

    <Section title="3. Distância entre turbinas">
      <p>O campo de quantidade de turbinas calcula o espaçamento médio linear ao longo da largura informada do parque. O resultado é exibido no cabeçalho, no diagnóstico e nos resumos exportados.</p>
      <DocCard>
        <Equation>
          <Var>s</Var><Op>=</Op><Frac top={<Var>W</Var>} bottom={<Row><Var>N</Var><Op>−</Op><Num>1</Num></Row>} /><Text> para </Text><Var>N</Var><Op>&gt;</Op><Num>1</Num>
        </Equation>
        <Equation>
          <Var>s</Var><Op>=</Op><Num>0</Num><Text> para </Text><Var>N</Var><Op>=</Op><Num>1</Num>
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          O cálculo usa <InlineFormula><Var>W</Var></InlineFormula> como largura do parque em quilômetros e <InlineFormula><Var>N</Var></InlineFormula> como número de turbinas. Ele não substitui um layout executivo com múltiplas fileiras, espaçamentos irregulares ou exclusões locais.
        </p>
      </DocCard>
    </Section>

    <Section title="4. Análise Gkeka-Serpetsidaki et al. (2022)">
      <p>Esta funcionalidade estima a perturbação visual por projeção: a altura e a superfície visível da turbina são projetadas em um plano de referência de 0,5 m e somadas para todas as turbinas do cenário.</p>
      <DocCard>
        <Equation>
          <SubVar symbol="H" sub="vis,G" /><Op>=</Op><Frac top={<Row><Num>0,5</Num><Text> m</Text></Row>} bottom={<Var>L</Var>} /><Op>×</Op><SubVar symbol="H" sub="vis,EVP" />
        </Equation>
        <Equation>
          <SubVar symbol="A" sub="vis,G" /><Op>=</Op>
          <Sup base={<Paren><Frac top={<Row><Num>0,5</Num><Text> m</Text></Row>} bottom={<Var>L</Var>} /></Paren>} exp={<Num>2</Num>} />
          <Op>×</Op><Var>A</Var><Op>×</Op><Frac top={<SubVar symbol="H" sub="vis,EVP" />} bottom={<Var>H</Var>} />
        </Equation>
        <Equation>
          <SubVar symbol="H" sub="vis,cm" /><Op>=</Op><Num>100</Num><Op>×</Op><SubVar symbol="H" sub="vis,G" />
        </Equation>
        <Equation>
          <SubVar symbol="O" sub="H" /><Op>=</Op><Var>N</Var><Op>×</Op><SubVar symbol="H" sub="vis,G" /><Op>;</Op><SubVar symbol="O" sub="A" /><Op>=</Op><Var>N</Var><Op>×</Op><SubVar symbol="A" sub="vis,G" />
        </Equation>
        <Equation>
          <SubVar symbol="O" sub="H" /><Op>&lt;</Op><Row><Num>0,6</Num><Text> m</Text></Row><Op>;</Op><SubVar symbol="O" sub="A" /><Op>&lt;</Op><Row><Num>0,0025</Num><Sup base={<Text> m</Text>} exp={<Num>2</Num>} /></Row>
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          Adaptação usada no simulador: <InlineFormula><SubVar symbol="H" sub="vis,EVP" /></InlineFormula> é a parcela da turbina acima do horizonte já corrigida por curvatura/refração, e a área entra proporcionalmente a essa fração visível. A métrica não considera atenuação atmosférica, cor, fundo visual ou percepção social; ela funciona como um segundo critério geométrico de triagem.
        </p>
      </DocCard>
    </Section>

    <Section title="5. Atmosfera, contraste e alcance visual">
      <p>O contraste remanescente segue um decaimento exponencial. Se o contraste inicial já estiver abaixo de 2%, o limite atmosférico é zero e a interface mostra o alvo como já invisível.</p>
      <DocCard>
        <Equation>
          <SubVar symbol="C" sub="d" /><Op>=</Op><SubVar symbol="C" sub="i" /><Op>×</Op><Sup base={<Var>e</Var>} exp={<Row><Op>−</Op><Var>β</Var><Op>×</Op><Var>d</Var></Row>} />
        </Equation>
        <Equation>
          <SubVar symbol="d" sub="limiar" /><Op>=</Op><Frac top={<Row><Fn>ln</Fn><Fence><Frac top={<SubVar symbol="C" sub="i" />} bottom={<Num>2</Num>} /></Fence></Row>} bottom={<Var>β</Var>} />
        </Equation>
        <p className="text-xs text-muted-foreground mt-3">
          Para <InlineFormula><Var>β</Var><Op>=</Op><Num>0</Num></InlineFormula>, o alcance atmosférico é ilimitado. Para <InlineFormula><SubVar symbol="C" sub="i" /><Op>&lt;</Op><Num>2</Num><Text>%</Text></InlineFormula>, o alcance atmosférico é <InlineFormula><Num>0</Num></InlineFormula>. A camada visual de névoa foi removida do campo periférico e do perfil lateral, mantendo a atmosfera como cálculo e diagnóstico.
        </p>
      </DocCard>
    </Section>

    <Section title="6. Probabilidade visual inspirada em Bishop (2002)">
      <p>O código usa o modelo logístico univariado equivalente ao intercepto consolidado <InlineFormula><Op>−</Op><Num>3,27</Num></InlineFormula>, evitando somar simultaneamente constantes de tabelas diferentes.</p>
      <DocCard>
        <Equation>
          <Var>M</Var><Op>=</Op><Text>area</Text><Op>×</Op><Num>1,2</Num>
        </Equation>
        <Equation>
          <Var>S</Var><Op>=</Op><Var>M</Var><Op>×</Op>
          <Sup
            base={<Bracket><Fn>arctan</Fn><Fence><Frac top={<Num>1</Num>} bottom={<Var>d</Var>} /></Fence><Op>×</Op><Frac top={<Num>180</Num>} bottom={<Var>π</Var>} /><Op>×</Op><Num>60</Num></Bracket>}
            exp={<Num>2</Num>}
          />
        </Equation>
        <Equation>
          <Var>Z</Var><Op>=</Op><Op>−</Op><Num>3,27</Num><Op>+</Op><Num>0,0124</Num><Op>×</Op><Paren><SubVar symbol="C" sub="d" /><Op>×</Op><Var>S</Var></Paren>
        </Equation>
        <Equation>
          <SubVar symbol="P" sub="detecção" /><Op>=</Op><Frac top={<Num>1</Num>} bottom={<Row><Num>1</Num><Op>+</Op><Sup base={<Var>e</Var>} exp={<Row><Op>−</Op><Var>Z</Var></Row>} /></Row>} /><Op>×</Op><Num>100</Num>
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
    <math className="min-w-max text-2xl text-foreground leading-relaxed" style={blockMathStyle}>
      <mrow>{children}</mrow>
    </math>
  </div>
);

const InlineFormula = ({ children }: { children: ReactNode }) => (
  <math className="inline-block align-middle text-foreground" style={mathStyle}>
    <mrow>{children}</mrow>
  </math>
);

const Var = ({ children }: { children: ReactNode }) => <mi>{children}</mi>;
const Num = ({ children }: { children: ReactNode }) => <mn>{children}</mn>;
const Op = ({ children }: { children: ReactNode }) => <mo>{children}</mo>;
const Fn = ({ children }: { children: ReactNode }) => <mtext>{children}</mtext>;
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

const Sqrt = ({ children }: { children: ReactNode }) => <msqrt><mrow>{children}</mrow></msqrt>;
const Fence = ({ children }: { children: ReactNode }) => <mrow><mo>(</mo>{children}<mo>)</mo></mrow>;
const Paren = ({ children }: { children: ReactNode }) => <mrow><mo>(</mo>{children}<mo>)</mo></mrow>;
const Bracket = ({ children }: { children: ReactNode }) => <mrow><mo>[</mo>{children}<mo>]</mo></mrow>;

export default TechnicalDocs;
