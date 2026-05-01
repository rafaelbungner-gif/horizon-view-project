import { describe, expect, it } from "vitest";
import {
  BISHOP_LOGIT_INTERCEPT,
  BISHOP_LOGIT_SLOPE,
  calculate,
  CONTRAST_THRESHOLD_PCT,
  EARTH_RADIUS_M,
  ROTOR_MOTION_AREA_FACTOR,
  type CalcInputs,
} from "./calculations";

const baseInputs: CalcInputs = {
  dist_km: 15,
  h_turbina: 260,
  h_obs: 2,
  largura_km: 10,
  num_turbinas: 9,
  area: 1500,
  ci: 35,
  k: 1.13,
  beta: 0,
};

const makeInputs = (overrides: Partial<CalcInputs> = {}): CalcInputs => ({
  ...baseInputs,
  ...overrides,
});

const deg = (rad: number) => (rad * 180) / Math.PI;

describe("calculate", () => {
  it("calculates the observer horizon and hidden turbine height", () => {
    const hObs = 2;
    const hiddenHeight = 25;
    const observerHorizonM = Math.sqrt(2 * EARTH_RADIUS_M * hObs);
    const distanceM = observerHorizonM + Math.sqrt(2 * EARTH_RADIUS_M * hiddenHeight);

    const out = calculate(makeInputs({
      dist_km: distanceM / 1000,
      h_obs: hObs,
      h_turbina: 100,
      k: 1,
    }));

    expect(out.horizonte_obs).toBeCloseTo(observerHorizonM, 6);
    expect(out.h_oculta).toBeCloseTo(hiddenHeight, 6);
    expect(out.h_visivel).toBeCloseTo(75, 6);
    expect(out.theta).toBeGreaterThan(0);
  });

  it("uses refraction k to extend the horizon and reduce hidden height", () => {
    const pureGeometry = calculate(makeInputs({ dist_km: 30, h_turbina: 200, h_obs: 2, k: 1 }));
    const refracted = calculate(makeInputs({ dist_km: 30, h_turbina: 200, h_obs: 2, k: 1.17 }));

    expect(refracted.horizonte_obs).toBeGreaterThan(pureGeometry.horizonte_obs);
    expect(refracted.h_oculta).toBeLessThan(pureGeometry.h_oculta);
    expect(refracted.h_visivel).toBeGreaterThan(pureGeometry.h_visivel);
    expect(refracted.distancia_geometrica_max_km).toBeGreaterThan(pureGeometry.distancia_geometrica_max_km);
  });

  it("adds horizon depression to theta when the target is beyond the observer horizon", () => {
    const inputs = makeInputs({ dist_km: 60, h_obs: 120, h_turbina: 300, k: 1.17 });
    const out = calculate(inputs);
    const distM = inputs.dist_km * 1000;
    const effectiveEarthRadius = EARTH_RADIUS_M * inputs.k;
    const expectedApproxTheta = deg(Math.atan(out.h_visivel / distM));
    const expectedDepression = deg(Math.atan(out.horizonte_obs / (2 * effectiveEarthRadius)));

    expect(distM).toBeGreaterThan(out.horizonte_obs);
    expect(out.theta_aproximado).toBeCloseTo(expectedApproxTheta, 10);
    expect(out.depressao_horizonte_deg).toBeCloseTo(expectedDepression, 10);
    expect(out.theta).toBeCloseTo(expectedApproxTheta + expectedDepression, 10);
  });

  it("keeps theta equal to the visible angular span before the observer horizon", () => {
    const out = calculate(makeInputs({ dist_km: 4, h_obs: 120, h_turbina: 300, k: 1.17 }));

    expect(out.depressao_horizonte_deg).toBe(0);
    expect(out.theta).toBe(out.theta_aproximado);
  });

  it("calculates spacing between turbines from park width and turbine count", () => {
    const out = calculate(makeInputs({ largura_km: 16, num_turbinas: 9 }));

    expect(out.distancia_entre_turbinas_km).toBeCloseTo(2, 10);
  });

  it("returns zero spacing when there is only one turbine", () => {
    const out = calculate(makeInputs({ largura_km: 16, num_turbinas: 1 }));

    expect(out.distancia_entre_turbinas_km).toBe(0);
  });

  it("applies atmospheric attenuation beta before marking the turbine visible", () => {
    const clearAir = calculate(makeInputs({ dist_km: 25, h_obs: 50, h_turbina: 300, beta: 0 }));
    const denseHaze = calculate(makeInputs({ dist_km: 25, h_obs: 50, h_turbina: 300, beta: 0.0003 }));

    expect(clearAir.cd).toBeCloseTo(35, 6);
    expect(clearAir.atmosfera_permite).toBe(true);
    expect(clearAir.isVisible).toBe(true);
    expect(clearAir.visibilityReason).toBe("visible");
    expect(denseHaze.h_visivel).toBeGreaterThan(0);
    expect(denseHaze.cd).toBeLessThan(CONTRAST_THRESHOLD_PCT);
    expect(denseHaze.atmosfera_permite).toBe(false);
    expect(denseHaze.isVisible).toBe(false);
    expect(denseHaze.visibilityReason).toBe("blocked_by_atmosphere");
  });

  it("calculates the atmospheric distance limit from beta and initial contrast", () => {
    const out = calculate(makeInputs({ ci: 35, beta: 0.00008 }));
    const expectedKm = Math.log(35 / CONTRAST_THRESHOLD_PCT) / 0.00008 / 1000;

    expect(out.distancia_atmosferica_max_km).toBeCloseTo(expectedKm, 6);
  });

  it("marks the atmospheric limit as zero when initial contrast is already below threshold", () => {
    const out = calculate(makeInputs({ ci: 1.5, beta: 0.00008 }));

    expect(out.distancia_atmosferica_max_km).toBe(0);
    expect(out.distancia_limite_visibilidade_km).toBe(0);
    expect(out.atmosfera_permite).toBe(false);
  });

  it("treats the contrast threshold as visible at the boundary", () => {
    const distM = 10_000;
    const betaAtThreshold = Math.log(baseInputs.ci / CONTRAST_THRESHOLD_PCT) / distM;
    const out = calculate(makeInputs({ dist_km: distM / 1000, beta: betaAtThreshold }));

    expect(out.cd).toBeCloseTo(CONTRAST_THRESHOLD_PCT, 10);
    expect(out.atmosfera_permite).toBe(true);
  });

  it("uses the consolidated Bishop Table 5 equivalent logit constants", () => {
    const inputs = makeInputs({ dist_km: 15, h_obs: 20, h_turbina: 260, area: 1500, ci: 35, beta: 0 });
    const out = calculate(inputs);
    const distM = inputs.dist_km * 1000;
    const oneMeterAngularMinutes = Math.atan(1 / distM) * deg(1) * 60;
    const visualMagnitude = inputs.area * ROTOR_MOTION_AREA_FACTOR * Math.pow(oneMeterAngularMinutes, 2);
    const logit = BISHOP_LOGIT_INTERCEPT + BISHOP_LOGIT_SLOPE * (out.cd * visualMagnitude);
    const expectedProbability = (1 / (1 + Math.exp(-logit))) * 100;

    expect(out.prob_pct).toBeCloseTo(expectedProbability, 10);
  });

  it("returns zero angular occupation when the turbine is fully hidden", () => {
    const out = calculate(makeInputs({
      dist_km: 200,
      h_turbina: 100,
      h_obs: 0,
      largura_km: 10,
      k: 1,
    }));

    expect(out.h_oculta).toBe(100);
    expect(out.h_visivel).toBe(0);
    expect(out.alpha).toBe(0);
    expect(out.theta).toBe(0);
    expect(out.prob_pct).toBe(0);
    expect(out.isVisible).toBe(false);
    expect(out.visibilityReason).toBe("hidden_by_horizon");
  });

  it("allows zero-width or zero-height edge cases without producing NaN", () => {
    const out = calculate(makeInputs({ h_turbina: 0, largura_km: 0 }));

    expect(out.h_oculta).toBe(0);
    expect(out.h_visivel).toBe(0);
    expect(out.alpha).toBe(0);
    expect(out.theta).toBe(0);
    expect(out.distancia_entre_turbinas_km).toBe(0);
    expect(out.visibilityReason).toBe("no_structure");
    expect(Number.isFinite(out.cd)).toBe(true);
  });

  it("rejects physically invalid inputs", () => {
    expect(() => calculate(makeInputs({ dist_km: 0 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ k: 0 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ beta: -0.1 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ h_obs: -1 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ num_turbinas: 0 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ num_turbinas: 2.5 }))).toThrow(RangeError);
  });
});
