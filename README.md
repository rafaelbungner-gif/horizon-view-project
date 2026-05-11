# Paisagem Marinha Eólica EVP

Simulador em React + Vite para estimar a visibilidade geométrica e atmosférica de turbinas eólicas offshore a partir de um observador em terra.

O painel combina seis blocos de cálculo:

- curvatura da Terra com raio efetivo por refração atmosférica (`k`)
- altura oculta e altura visível da turbina
- ocupação angular horizontal (`alpha`) e vertical real (`theta`)
- contraste remanescente e probabilidade de detecção visual inspirada em Bishop (2002)
- distância média entre turbinas a partir da largura do parque e do número de turbinas
- análise de perturbação visual baseada em Gkeka-Serpetsidaki, Papadopoulos e Tsoutsos (2022)

## Recursos de usabilidade

- Cenário único e direto, sem presets e sem comparação A/B.
- Diagnóstico explícito do motivo da invisibilidade: horizonte, atmosfera, ambos ou ausência de estrutura.
- Distância máxima por geometria, distância máxima por contraste e limitante dominante.
- Campo `Número de Turbinas` para calcular o espaçamento médio entre turbinas.
- Painel `Análise Gkeka-Serpetsidaki et al. (2022)` com `H_vis`, `A_vis`, `O_H`, `O_A` e status dos limiares.
- Exportação de resumo técnico em PNG e impressão/salvamento em PDF pelo navegador.
- Canvases com renderização sob demanda e animação opcional dos rotores.
- Campo de visão periférico e perfil lateral sem camada visual de névoa.
- Referência angular Sol/Lua de aproximadamente `0,5°` no canvas vertical.

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalação

```bash
npm install
```

O repositório mantém apenas as dependências usadas pela aplicação atual. Caso você precise reintroduzir componentes do template ShadCN/Lovable, reinstale explicitamente os pacotes correspondentes.

## Execução local

```bash
npm run dev
```

A aplicação sobe em Vite. Pela configuração atual, o servidor usa a porta `8080`.

## Build, testes e checagens

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Os testes unitários cobrem `calculate()` para horizonte geométrico, refração (`k`), atenuação atmosférica (`beta`), limiar de contraste, depressão do horizonte, diagnóstico de invisibilidade, distâncias-limite, espaçamento entre turbinas, análise Gkeka 2022 e casos-limite.

## Estrutura de pastas

```text
.
├── public/                  # arquivos estáticos servidos pelo Vite
├── src/                     # código-fonte da aplicação
│   ├── components/          # componentes reutilizáveis da interface
│   │   ├── ControlSlider.tsx        # controles numéricos dos parâmetros
│   │   ├── FOVCanvas.tsx            # campo de visão periférico, sem névoa visual
│   │   ├── GkekaAssessment.tsx      # painel da análise Gkeka-Serpetsidaki et al. (2022)
│   │   ├── MetricCard.tsx           # cartões de métricas do cabeçalho
│   │   ├── ProfileCanvas.tsx        # perfil lateral da curvatura, sem névoa visual
│   │   ├── TechnicalDocs.tsx        # memorial de cálculo exibido na página
│   │   └── VerticalFOVCanvas.tsx    # simulação angular vertical e largura do parque
│   ├── hooks/               # hooks reutilizáveis
│   │   └── useCanvasRenderer.ts     # setup de canvas e render sob demanda
│   ├── lib/                 # núcleo matemático e testes
│   │   ├── calculations.ts          # função calculate(), constantes físicas e métricas Gkeka
│   │   └── calculations.test.ts     # testes unitários do modelo
│   ├── pages/               # telas principais
│   │   └── Index.tsx                # composição da simulação e exportações
│   ├── App.tsx              # roteamento/base da aplicação
│   ├── main.tsx             # entrada React
│   └── index.css            # estilos globais e tokens visuais
├── package.json             # scripts, dependências e metadados do app
├── tailwind.config.ts       # configuração visual do Tailwind
├── tsconfig.json            # configuração TypeScript com strictNullChecks
└── vite.config.ts           # configuração do Vite
```

## Modelo matemático

### Entradas principais

- `dist_km`: distância do observador ao parque, em quilômetros
- `h_obs`: elevação do observador, em metros
- `h_turbina`: altura máxima da turbina, em metros
- `largura_km`: largura lateral do parque, em quilômetros
- `num_turbinas`: quantidade de turbinas distribuídas na largura informada
- `area`: área sólida transversal percebida, em metros quadrados
- `ci`: contraste inicial, em porcentagem
- `k`: fator de refração atmosférica aplicado ao raio terrestre
- `beta`: coeficiente de extinção atmosférica, em `m^-1`

### Curvatura e refração

O modelo usa o raio efetivo da Terra:

```text
R_efetivo = R_terra * k
```

A distância ao horizonte do observador é aproximada por:

```text
d_obs = sqrt(2 * R_efetivo * h_obs)
```

Quando a turbina está além desse horizonte, a altura oculta é estimada por:

```text
h_oculta = max(0, d - d_obs)^2 / (2 * R_efetivo)
```

Depois, `h_oculta` é limitada ao intervalo `[0, h_turbina]`, e a altura visível é:

```text
h_visivel = max(0, h_turbina - h_oculta)
```

A distância geométrica máxima para que a ponta da turbina ainda possa aparecer é:

```text
d_geom_max = sqrt(2 * R_efetivo * h_obs) + sqrt(2 * R_efetivo * h_turbina)
```

Valores típicos de `k`:

- `1.00`: geometria pura, sem refração
- `1.13`: aproximação comum em análises GIS/ZTV
- `1.17`: aproximação citada em orientações de visualização de parques eólicos

### Ocupação angular

Se existe altura visível, o modelo calcula:

```text
alpha = 2 * atan(W / (2d))
theta_geom = atan(h_visivel / d)
```

Quando `d > d_obs`, a leitura vertical inclui a depressão angular do horizonte para observadores elevados:

```text
depressao_horizonte = atan(d_obs / (2 * R_efetivo))
theta_real = theta_geom + depressao_horizonte
```

`alpha`, `theta_geom`, `depressao_horizonte` e `theta_real` são convertidos para graus. A interface exibe `theta_real` como o ângulo vertical principal e mantém `theta_geom` nos resumos técnicos para comparação.

### Distância entre turbinas

O espaçamento médio considera uma distribuição linear simples ao longo da largura informada do parque:

```text
se num_turbinas > 1:
  distancia_entre_turbinas = largura_km / (num_turbinas - 1)

se num_turbinas = 1:
  distancia_entre_turbinas = 0
```

Esse valor é uma aproximação de primeira ordem. Ele não modela múltiplas fileiras, stagger, corredores de navegação, exclusões ambientais ou layout real de aerogeradores.

### Análise Gkeka-Serpetsidaki et al. (2022)

A funcionalidade projeta a altura e a superfície visível da turbina em um plano de referência de `0,5 m`, soma os valores para todas as turbinas do cenário e compara com dois limiares de perturbação visual.

```text
H_vis,G = (0,5 / L) * H_vis,EVP
A_vis,G = (0,5 / L)^2 * A * (H_vis,EVP / H)
O_H = N * H_vis,G
O_A = N * A_vis,G
```

Os limiares exibidos no programa são:

```text
O_H < 0,6 m
O_A < 0,0025 m²
```

Adaptação usada no simulador: o artigo apresenta a projeção com a altura e a área da turbina. No programa, `H_vis,EVP` é a parte geometricamente visível já calculada pela curvatura/refração, e a área é proporcionalmente reduzida pela fração visível. Essa escolha evita contar como impacto visual a parcela abaixo do horizonte.

Referência: Gkeka-Serpetsidaki, P.; Papadopoulos, S.; Tsoutsos, T. (2022). `Assessment of the visual impact of offshore wind farms`. Renewable Energy, 190, 358-370. DOI: `10.1016/j.renene.2022.03.091`.

### Atenuação atmosférica

O contraste remanescente é calculado por decaimento exponencial:

```text
C_d = C_i * exp(-beta * d)
transmissao = C_d / C_i = exp(-beta * d)
```

A aplicação usa `2%` como limiar operacional de contraste. Se `C_d < 2%`, a estrutura pode estar geometricamente acima do horizonte, mas é marcada como não detectável pela atmosfera.

A relação entre `beta` e alcance meteorológico costuma ser aproximada por `V = 3.912 / beta`, mas o alcance até o limiar de contraste depende também de `C_i`:

```text
d_limiar = ln(C_i / 2) / beta
```

Se `beta = 0`, o limite atmosférico é infinito. Se `C_i < 2%`, o limite atmosférico é `0 km` e a UI mostra o alvo como já invisível por contraste.

### Probabilidade de detecção

Quando há altura visível e contraste suficiente, a probabilidade de detecção usa uma função logística baseada em Bishop (2002). O código consolida o intercepto equivalente em `-3.27`, evitando somar simultaneamente constantes de modelos/tabelas diferentes.

```text
M = area * 1.2
S = M * [atan(1 / d) * 180/pi * 60]^2
Z = -3.27 + 0.0124 * (C_d * S)
P = 1 / (1 + exp(-Z))
```

O fator `1.2` representa a amplificação perceptual aproximada pelo movimento das pás.

## Premissas

- O observador e a turbina estão no mesmo datum vertical, com alturas em relação ao nível médio do mar.
- A distância é uma linha reta horizontal simplificada entre observador e parque.
- A turbina é representada por altura máxima e área transversal agregada, não por geometria 3D detalhada.
- As turbinas são distribuídas linearmente na largura informada apenas para estimar espaçamento médio.
- A análise Gkeka 2022 usa a porção geometricamente visível da turbina calculada pelo próprio simulador.
- `beta` é uniforme ao longo de todo o percurso óptico.
- A refração é constante e resumida por um único `k`.
- A visibilidade atmosférica usa contraste percentual, não luminância espectral calibrada.

## Limitações

- Não substitui estudo visual, campanha fotográfica, ZTV/GIS ou validação regulatória.
- Não considera relevo intermediário, edificações, ilhas, ondas ou vegetação.
- Não modela variação temporal de clima, brilho solar, horário, cor da turbina ou fundo visual.
- O parque é simplificado como uma largura angular contínua; layouts reais com múltiplas linhas podem alterar a percepção.
- O espaçamento calculado não representa layout executivo do parque eólico.
- A análise Gkeka 2022 é uma triagem geométrica/projetiva; ela não inclui percepção social, questionários, cor, fundo, iluminação ou condições meteorológicas.
- A probabilidade de detecção depende de calibração empírica e deve ser tratada como indicador comparativo, não como verdade absoluta.
- Para distâncias muito curtas, a aproximação de pequena curvatura deixa de ser o principal fator e deve ser interpretada com cautela.

## Renderização

Os canvases renderizam sob demanda por padrão: redesenham quando parâmetros mudam ou quando o tamanho do componente muda. A animação dos rotores é opcional e pode ser ligada no painel, evitando um loop contínuo de `requestAnimationFrame` quando a cena está estática.

O campo de visão periférico e o perfil lateral não aplicam camada visual de névoa. A atenuação atmosférica permanece no cálculo, nas métricas e no diagnóstico de visibilidade.

O canvas vertical usa escala angular explícita, mostra referência Sol/Lua de `0,5°` e evita transformar objetos subpixel em turbinas artificialmente grandes. Quando a porção visível é menor que a resolução útil do canvas, a cena usa um marcador e informa que a altura angular está abaixo da escala visual. Para preservar a legibilidade, a visualização limita a quantidade desenhada de turbinas, mas o cálculo de espaçamento usa sempre o número informado.

## Publicação na web

A forma mais simples de conferir a funcionalidade online é publicar pelo GitHub Pages ou por um serviço como Vercel/Netlify. Para GitHub Pages, use o build `npm run build` e publique a pasta `dist/` como saída estática.
