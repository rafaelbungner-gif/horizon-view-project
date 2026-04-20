

## Plano: Escala adaptativa das turbinas + reposicionar label θ

### 1. Turbinas que diminuem conforme largura do parque

Hoje o desenho usa um tamanho mínimo de leitura fixo (`max(θ_px, 18px)`) idêntico para todas as N turbinas — por isso aparecem grandes e empilhadas mesmo quando a faixa α é estreita ou quando há muitas turbinas próximas.

Mudanças no `VerticalFOVCanvas.tsx`:

- **Calcular espaçamento real entre turbinas** em pixels:
  `spacingPx = (alpha * pxPerDegH) / max(N - 1, 1)` (ou `viewW / N` se α = 0).
- **Definir largura máxima permitida por turbina** baseada no espaçamento — para que pás de turbinas vizinhas não se sobreponham:
  `maxTurbineWidth = spacingPx * 0.7` (deixa 30% de respiro entre elas).
- **Calcular altura visual proporcional respeitando essa largura**:
  - A largura atual da pá é `~0.4 * towerH * scale`. Inverte: `maxTowerH = maxTurbineWidth / 0.85` (considerando pás dos dois lados).
  - `drawnPx = clamp(thetaPx, minLeitura, maxTowerH)`.
- **Reduzir o mínimo de leitura quando há muitas turbinas**: `minLeitura = clamp(spacingPx * 0.35, 6, 18)` — assim, quando o espaçamento é apertado, o mínimo encolhe para 6px (ainda perceptível mas não atropela vizinhos).
- **Resultado**: parques largos com muitas turbinas terão silhuetas menores e mais densas (efeito visual de "fileira distante"); parques estreitos com poucas turbinas mantêm tamanho de leitura confortável.

### 2. Reposicionar o indicador θ

Hoje o label "θ = X.XXX°" fica ancorado na turbina central (`centerX + 30`), sobrepondo turbinas vizinhas conforme visto na imagem.

Mudanças:

- Mover a **medição de θ (linha + setas + label)** para o **canto superior esquerdo** do painel POV, dentro da viewport, como uma "legenda flutuante":
  - Ancorar em `(marginL + 12, marginT + 12)`.
  - Desenhar uma mini-régua vertical com a altura proporcional a `drawnPx` (mesma escala visual da turbina), com setas em ambas as extremidades.
  - Label `θ = X.XXX°` ao lado da régua.
  - Adicionar um leve fundo escuro semi-transparente (`hsla(215, 50%, 12%, 0.75)`) com padding 6px e cantos arredondados para legibilidade sobre o céu.
  - Manter a observação `(escala mín. p/ leitura)` dentro do mesmo bloco quando aplicável.
- Remover a antiga indicação θ ao lado da turbina central — fica apenas a legenda no canto.
- A "lupa de zoom 20×" continua no canto inferior direito (sem mudança).

### Arquivos modificados

- **`src/components/VerticalFOVCanvas.tsx`** — única alteração; nenhuma mudança de props ou em `Index.tsx`.

