

## Plano: Suavizar transição da escala + indicador de área visível

### Problema atual

A escala adaptativa hoje usa duas regras descontínuas:
- `N = clamp(round(largura_km / 1.0), 3, 15)` → salta de 3 para 4 turbinas quando largura passa de 3,5 → 4,5 km
- `minLeitura = clamp(spacingPx * 0.35, 6, 18)` → muda bruscamente quando o espaçamento varia

Resultado: ao mover o slider de 1 km para 2 km, o número de turbinas pula de 3 para 3 (ok) mas a faixa α dobra, então `spacingPx` dobra, `maxTowerH` dobra, e a turbina **dobra de tamanho instantaneamente** — visualmente "salta".

### Mudanças no `VerticalFOVCanvas.tsx`

**1. Suavizar contagem de turbinas (N fracionário com fade)**
- Continuar com `N = clamp(round(largura_km / espacamento), 3, 15)` para nº inteiro desenhado.
- Mas adicionar **opacidade extra nas turbinas das pontas** proporcional à fração entre N e N+1 — quando largura está no meio do intervalo (ex: 3,5 km), as duas turbinas extras "nascem" com fade-in suave, em vez de aparecerem do nada.
- Fórmula: `Nfrac = largura_km / espacamento`; turbinas além de `floor(Nfrac)` recebem `α = (Nfrac - floor(Nfrac))`.

**2. Suavizar escala da silhueta**
- Substituir o clamp duro por uma função suave (smoothstep) entre `minLeitura` e `maxTowerH`:
  - `t = smoothstep(0, maxTowerH, thetaPx)` → transição contínua quando largura cresce.
- `minLeitura` e `maxTowerH` continuam variando com `spacingPx`, mas a interpolação fica gradual.

**3. Indicador de área visível ao lado da legenda θ**
- Ampliar o card flutuante (canto superior esquerdo) para incluir uma segunda linha:
  ```
  θ = 0.123°       ← já existe
  α = 1.45°        ← NOVO
  Área visível: H × W   ← NOVO
    H = X m (altura visível real)
    W ≈ Y km (largura do parque)
  ```
- "Área visível" mostra: `h_visivel` (m) × `largura_km` (km) — dá ao usuário a noção concreta do que está sendo desenhado.
- Quando `h_visivel = 0` (oculta pelo horizonte): mostrar "100% oculta" em vermelho.
- Mini-régua vertical do θ permanece; adicionar uma mini-régua horizontal pequena indicando α na mesma legenda.

**4. Ajuste fino do espaçamento padrão**
- Aumentar `espacamento` típico de 1,0 km → 1,2 km (espaçamento offshore mais realista para parques modernos), o que reduz frequência das transições no slider de largura.
- Manter limite máximo de 15 turbinas desenhadas.

### Arquivos modificados

- **`src/components/VerticalFOVCanvas.tsx`** — única alteração; sem mudanças em props ou em `Index.tsx`.

