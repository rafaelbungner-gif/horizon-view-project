
## Plano: Visualizador de Impacto Vertical (θ)

Hoje o dashboard mostra:
- **FOVCanvas** — visão superior (cone horizontal α de 180°)
- **ProfileCanvas** — perfil lateral com curvatura da Terra

Falta uma **simulação visual da ocupação vertical θ** — o quanto a turbina "preenche" o campo de visão vertical do observador (típicamente ~60° úteis). É um indicador-chave do SVIA: mesmo uma turbina visível pode ter θ ≈ 0,003°, ou seja, um pontinho.

### O que será criado

**Novo componente `VerticalFOVCanvas.tsx`** — uma simulação em primeira pessoa do que o observador vê olhando para o horizonte:

```text
┌───────────────────────────────────┐
│        CÉU                         │
│                                    │
│    ↑                               │
│    │ θ = 0.123°                    │
│    │ ▲ (turbina vista pelo obs.)  │
│    ↓ ─────────── horizonte ──────  │
│        MAR                         │
│                                    │
│  Campo visual vertical: 60°        │
└───────────────────────────────────┘
```

Características:
- Janela representando o **campo de visão vertical humano útil (~60°)** com escala angular nas laterais (-30° a +30°)
- **Linha do horizonte** clara no centro
- **Silhueta da turbina** desenhada na altura angular real `θ` acima do horizonte, com pás animadas
- **Porção oculta** indicada abaixo do horizonte (linha tracejada vermelha mostrando o que a curvatura da Terra "engoliu")
- **Indicador de escala**: "θ = X.XXX°" e barra mostrando proporção θ vs FOV total
- **Cortina de névoa** quando `isVisible=false`
- **Zoom inteligente**: se θ for muito pequeno (< 0,5°), adicionar uma "lupa" no canto mostrando a turbina ampliada — para usuário perceber que mesmo "visível" pode ser imperceptível
- Mensagem quando θ = 0 (oculta pelo horizonte)

### Layout

A grade de visualizações passa de 2 colunas para um arranjo com 3 painéis:
- **Linha 1**: `FOVCanvas` (horizontal) + `ProfileCanvas` (lateral) — lado a lado como hoje
- **Linha 2**: novo `VerticalFOVCanvas` ocupando largura total (full width) — pois é o painel mais imersivo

Em telas menores, todos empilham verticalmente.

### Arquivos modificados

1. **`src/components/VerticalFOVCanvas.tsx`** (novo) — componente do simulador POV vertical
2. **`src/pages/Index.tsx`** — incluir o novo painel logo após o grid atual de visualizações; passar props `theta`, `h_visivel`, `h_oculta`, `h_turbina`, `dist_km`, `isVisible`

### Detalhes técnicos

- Canvas com `requestAnimationFrame` para rotação contínua das pás
- FOV vertical fixo em **60°** (referência ergonômica do campo útil humano em pé) — exibido como contexto
- Conversão: `pixelsPerDegree = canvasHeight / 60`
- Altura angular da torre visível desenhada como triângulo/silhueta proporcional a θ
- Lupa (mini-canvas) ativada quando `θ < 0.5°` mostrando a turbina em escala 10× para evidenciar a discrepância entre "visível matematicamente" e "perceptível"
- Sem alteração nos cálculos de `calculations.ts` — apenas nova representação visual de `theta`
