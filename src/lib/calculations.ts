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

export const EARTH_RADIUS_M = 6_371_000;
export const CONTRAST_THRESHOLD_PCT = 2.0;
export const ROTOR_MOTION_AREA_FACTOR = 1.2;

const DEG_PER_RAD = 180 / Math.PI;
const ARC_MINUTES_PER_DEGREE = 60;

function assertFiniteNumber(name: keyof CalcInputs, value: number) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number.`);
  }
}

function assertNonNegative(name: keyof CalcInputs, value: number) {
  assertFiniteNumber(name, value);
  if (value < 0) {
    throw new RangeError(`${name} must be greater than or equal to zero.`);
  }
}

function assertPositive(name: keyof CalcInputs, value: number) {
  assertFiniteNumber(name, value);
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than zero.`);
  }
}

function validateInputs(inputs: CalcInputs) {
  assertPositive("dist_km", inputs.dist_km);
  assertNonNegative("h_turbina", inputs.h_turbina);
  assertNonNegative("h_obs", inputs.h_obs);
  assertNonNegative("largura_km", inputs.largura_km);
  assertNonNegative("area", inputs.area);
  assertNonNegative("ci", inputs.ci);
  assertPositive("k", inputs.k);
  assertNonNegative("beta", inputs.beta);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculate(inputs: CalcInputs): CalcOutputs {
  validateInputs(inputs);

  const { dist_km, h_turbina, h_obs, largura_km, area, ci, k, beta } = inputs;
  const dist_m = dist_km * 1000;
  const largura_m = largura_km * 1000;
  const effectiveEarthRadius = EARTH_RADIUS_M * k;

  // Curvature is approximated with an effective Earth radius that includes refraction.
  const horizonte_obs = Math.sqrt(2 * effectiveEarthRadius * h_obs);
  const distanceBeyondHorizon = Math.max(0, dist_m - horizonte_obs);
  const rawHiddenHeight = Math.pow(distanceBeyondHorizon, 2) / (2 * effectiveEarthRadius);
  const h_oculta = clamp(rawHiddenHeight, 0, h_turbina);
  const h_visivel = Math.max(0, h_turbina - h_oculta);

  const cd = ci * Math.exp(-beta * dist_m);
  const atmosfera_permite = cd + 1e-12 >= CONTRAST_THRESHOLD_PCT;
  const isVisible = h_visivel > 0 && atmosfera_permite;

  let alpha = 0;
  let theta = 0;
  if (h_visivel > 0) {
    alpha = 2 * Math.atan(largura_m / (2 * dist_m)) * DEG_PER_RAD;
    theta = Math.atan(h_visivel / dist_m) * DEG_PER_RAD;
  }

  let prob_pct = 0;
  if (isVisible && area > 0 && cd > 0) {
    const perceivedArea = area * ROTOR_MOTION_AREA_FACTOR;
    const oneMeterAngularMinutes = Math.atan(1 / dist_m) * DEG_PER_RAD * ARC_MINUTES_PER_DEGREE;
    const visualMagnitude = perceivedArea * Math.pow(oneMeterAngularMinutes, 2);
    const logit = -16.02 + 0.0124 * (cd * visualMagnitude) + 12.75;
    const probability = 1 / (1 + Math.exp(-logit));
    prob_pct = clamp(probability * 100, 0, 100);
  }

  return { h_oculta, h_visivel, alpha, theta, prob_pct, cd, isVisible, atmosfera_permite, horizonte_obs };
}
