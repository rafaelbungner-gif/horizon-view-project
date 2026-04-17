

## Plano: Adicionar largura do parque (α) à simulação POV vertical

Hoje o `VerticalFOVCanvas` desenha **uma única turbina** centralizada — mostra bem a altura angular θ, mas ignora a **extensão horizontal** do parque (α, que já é calculada e exibida no header).

A ideia é representar visualmente **a fileira de turbinas** preenchendo o ângulo α dentro do mesmo painel POV, dando ao usuário a real percepção da magnitude paisagística.

### O que muda no `VerticalFOVCanvas.tsx`

1. **Nova prop**: `alpha` (ocupação horizontal em graus) e `largura_km` (já disponíveis no `Index.tsx`).
2. **Régua angular horizontal** no topo da janela (-30° a +30° horizontais), espelhando a régua vertical lateral que já existe.
3. **Faixa do parque**: uma região destacada no horizonte representando a largura angular α (em verde translúcido quando visível, cinza quando atenuado).
4. **Múltiplas turbinas distribuídas**:
   - Estimar nº de turbinas a desenhar: `N = clamp(round(largura_km / 1.0), 3, 15)` (espaçamento típico ~1 km entre turbinas offshore, limitado para não poluir).
   - Distribuir uniformemente dentro da faixa angular α centrada no horizonte.
   - Cada turbina herda a mesma altura angular θ e o mesmo desenho (torre + nacelle + pás giratórias).
   - Turbinas das bordas ficam levemente mais transparentes (efeito de perspectiva atmosférica).
5. **Indicador α** abaixo do horizonte: linha horizontal com setas marcando os limites do parque + label `α = X.XX°` e `largura ≈ Y km`.
6. **Caso α > 60°** (parque maior que o FOV horizontal exibido): turbinas continuam até as bordas e aparece a marca "...continua além do FOV" nas extremidades.
7. **Lupa de zoom**: continua funcionando, mas mostra apenas a turbina central (representativa).
8. **Barra de rodapé**: adicionar segunda métrica — `Ocupação horizontal: X% do FOV` ao lado da vertical já existente.

### Layout do painel (ASCII)

```text
┌──────────────────────────────────────────────┐
│ -30°  -20°  -10°   0°   +10°  +20°  +30° (H) │
│ ┌──────────────────────────────────────────┐ │
│+30°│        CÉU                            │ │
│    │                                       │ │
│ 0° │ ▲  ▲  ▲  ▲  ▲  ▲  ▲ ──── horizonte ── │ │
│    │ │  │  │  │  │  │  │   ←─── α ───→     │ │
│-30°│        MAR                            │ │
│    └──────────────────────────────────────┘ │
│ Vertical: 0.003% | Horizontal: 12.5% do FOV │
└──────────────────────────────────────────────┘
```

### Arquivos modificados

1. **`src/components/VerticalFOVCanvas.tsx`** — adicionar props `alpha` e `largura_km`; nova régua horizontal; loop desenhando N turbinas; indicador da largura α; segunda métrica no rodapé.
2. **`src/pages/Index.tsx`** — passar `alpha={out.alpha}` e `largura_km={inputs.largura_km}` para `VerticalFOVCanvas`.

Sem alterações em `calculations.ts` — apenas nova representação visual de variáveis já calculadas.

