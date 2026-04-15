export interface CalcInputs {
  dist_km: number;
  h_turbina: number;
  h_obs: number;
  largura_km: number;
  area: number;
  ci: number;
  k: number;
  beta: number;
}

export interface CalcOutputs {
  h_oculta: number;
  h_visivel: number;
  alpha: number;
  theta: number;
  prob_pct: number;
  cd: number;
  isVisible: boolean;
  atmosfera_permite: boolean;
  horizonte_obs: number;
}

const R_TERRA = 6371000;

export function calculate(inputs: CalcInputs): CalcOutputs {
  const { dist_km, h_turbina, h_obs, largura_km, area, ci, k, beta } = inputs;
  const dist_m = dist_km * 1000;
  const largura_m = largura_km * 1000;

  // PASSO 1: Filtragem Topográfica
  const horizonte_obs = Math.sqrt(2 * k * R_TERRA * h_obs);
  let h_oculta = 0;
  if (dist_m > horizonte_obs) {
    h_oculta = Math.pow(dist_m - horizonte_obs, 2) / (2 * R_TERRA * k);
  }
  h_oculta = Math.min(h_oculta, h_turbina);
  const h_visivel = Math.max(0, h_turbina - h_oculta);

  // PASSO 2: Dissolução Atmosférica
  const cd = ci * Math.exp(-beta * dist_m);
  const atmosfera_permite = cd >= 2.0;
  const isVisible = h_visivel > 0 && atmosfera_permite;

  // PASSO 3: Magnitude Paisagística (SVIA)
  let alpha = 0;
  let theta = 0;
  if (h_visivel > 0) {
    alpha = 2 * Math.atan(largura_m / (2 * dist_m)) * (180 / Math.PI);
    theta = Math.atan(h_visivel / dist_m) * (180 / Math.PI);
  }

  // PASSO 4: Probabilidade (Bishop 2002)
  let prob_pct = 0;
  if (isVisible) {
    const M = area * 1.2;
    const angulo_minutos = Math.atan(1 / dist_m) * (180 / Math.PI) * 60;
    const S = M * Math.pow(angulo_minutos, 2);
    const Z_ud = -16.02 + 0.0124 * (cd * S) + 12.75;
    const prob = 1 / (1 + Math.exp(-Z_ud));
    prob_pct = prob * 100;
  }

  return { h_oculta, h_visivel, alpha, theta, prob_pct, cd, isVisible, atmosfera_permite, horizonte_obs };
}
