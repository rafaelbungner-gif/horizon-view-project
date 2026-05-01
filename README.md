# Paisagem Marinha Eólica EVP

Simulador em React + Vite para estimar a visibilidade geométrica e atmosférica de turbinas eólicas offshore a partir de um observador em terra.

O painel combina quatro blocos de cálculo:

- curvatura da Terra com raio efetivo por refração atmosférica (`k`)
- altura oculta e altura visível da turbina
- ocupação angular horizontal (`alpha`) e vertical (`theta`)
- contraste remanescente e probabilidade de detecção visual inspirada em Bishop (2002)

## Recursos de usabilidade

- Presets rápidos para praia, mirante, prédio alto, ar limpo e névoa leve.
- Diagnóstico explícito do motivo da invisibilidade: horizonte, atmosfera, ambos ou ausência de estrutura.
- Distância máxima por geometria, distância máxima por contraste e limitante dominante.
- Comparação A/B entre cenário atual e cenário de referência.
- Exportação de resumo técnico em PNG e impressão/salvamento em PDF pelo navegador.
- Canvases com renderização sob demanda e animação opcional dos rotores.

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

Os testes unitários cobrem `calculate()` para horizonte geométrico, refração (`k`), atenuação atmosférica (`beta`), limiar de contraste, diagnóstico de invisibilidade, distâncias-limite e casos-limite.

## Modelo matemático

### Entradas principais

- `dist_km`: distância do observador ao parque, em quilômetros
- `h_obs`: elevação do observador, em metros
- `h_turbina`: altura máxima da turbina, em metros
- `largura_km`: largura lateral do parque, em quilômetros
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
h_oculta = (d - d_obs)^2 / (2 * R_efetivo)
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
theta = atan(h_visivel / d)
```

`alpha` e `theta` são convertidos para graus. `alpha` mede a ocupação horizontal do parque; `theta` mede a ocupação vertical da porção visível.

### Atenuação atmosférica

O contraste remanescente é calculado por decaimento exponencial:

```text
C_d = C_i * exp(-beta * d)
```

A aplicação usa `2%` como limiar operacional de contraste. Se `C_d < 2%`, a estrutura pode estar geometricamente acima do horizonte, mas é marcada como não detectável pela atmosfera.

A relação entre `beta` e alcance meteorológico costuma ser aproximada por `V = 3.912 / beta`, mas o alcance até o limiar de contraste depende também de `C_i`:

```text
d_limiar = ln(C_i / 2) / beta
```

Por isso, a mesma névoa pode permitir ou impedir visibilidade dependendo do contraste inicial assumido.

### Probabilidade de detecção

Quando há altura visível e contraste suficiente, a probabilidade de detecção usa uma função logística baseada em Bishop (2002):

```text
M = area * 1.2
S = M * [atan(1 / d) * 180/pi * 60]^2
Z = -16.02 + 0.0124 * (C_d * S) + 12.75
P = 1 / (1 + exp(-Z))
```

O fator `1.2` representa a amplificação perceptual aproximada pelo movimento das pás.

## Premissas

- O observador e a turbina estão no mesmo datum vertical, com alturas em relação ao nível médio do mar.
- A distância é uma linha reta horizontal simplificada entre observador e parque.
- A turbina é representada por altura máxima e área transversal agregada, não por geometria 3D detalhada.
- `beta` é uniforme ao longo de todo o percurso óptico.
- A refração é constante e resumida por um único `k`.
- A visibilidade atmosférica usa contraste percentual, não luminância espectral calibrada.

## Limitações

- Não substitui estudo visual, campanha fotográfica, ZTV/GIS ou validação regulatória.
- Não considera relevo intermediário, edificações, ilhas, ondas ou vegetação.
- Não modela variação temporal de clima, brilho solar, horário, cor da turbina ou fundo visual.
- O parque é simplificado como uma largura angular contínua; layouts reais com múltiplas linhas podem alterar a percepção.
- A probabilidade de detecção depende de calibração empírica e deve ser tratada como indicador comparativo, não como verdade absoluta.
- Para distâncias muito curtas, a aproximação de pequena curvatura deixa de ser o principal fator e deve ser interpretada com cautela.

## Renderização

Os canvases renderizam sob demanda por padrão: redesenham quando parâmetros mudam ou quando o tamanho do componente muda. A animação dos rotores é opcional e pode ser ligada no painel, evitando um loop contínuo de `requestAnimationFrame` quando a cena está estática.
