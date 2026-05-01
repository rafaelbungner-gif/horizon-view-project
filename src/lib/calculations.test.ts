import { describe, expect, it } from "vitest";
import {
  calculate,
  CONTRAST_THRESHOLD_PCT,
  EARTH_RADIUS_M,
  type CalcInputs,
} from "./calculations";

const baseInputs: CalcInputs = {
  dist_km: 15,
  h_turbina: 260,
  h_obs: 2,
  largura_km: 10,
  area: 1500,
  ci: 35,
  k: 1.13,
  beta: 0,
};

const makeInputs = (overrides: Partial<CalcInputs> = {}): CalcInputs => ({
  ...baseInputs,
  ...overrides,
});

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
  });

  it("applies atmospheric attenuation beta before marking the turbine visible", () => {
    const clearAir = calculate(makeInputs({ dist_km: 25, h_obs: 50, h_turbina: 300, beta: 0 }));
    const denseHaze = calculate(makeInputs({ dist_km: 25, h_obs: 50, h_turbina: 300, beta: 0.0003 }));

    expect(clearAir.cd).toBeCloseTo(35, 6);
    expect(clearAir.atmosfera_permite).toBe(true);
    expect(clearAir.isVisible).toBe(true);
    expect(denseHaze.h_visivel).toBeGreaterThan(0);
    expect(denseHaze.cd).toBeLessThan(CONTRAST_THRESHOLD_PCT);
    expect(denseHaze.atmosfera_permite).toBe(false);
    expect(denseHaze.isVisible).toBe(false);
  });

  it("treats the contrast threshold as visible at the boundary", () => {
    const distM = 10_000;
    const betaAtThreshold = Math.log(baseInputs.ci / CONTRAST_THRESHOLD_PCT) / distM;
    const out = calculate(makeInputs({ dist_km: distM / 1000, beta: betaAtThreshold }));

    expect(out.cd).toBeCloseTo(CONTRAST_THRESHOLD_PCT, 10);
    expect(out.atmosfera_permite).toBe(true);
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
  });

  it("allows zero-width or zero-height edge cases without producing NaN", () => {
    const out = calculate(makeInputs({ h_turbina: 0, largura_km: 0 }));

    expect(out.h_oculta).toBe(0);
    expect(out.h_visivel).toBe(0);
    expect(out.alpha).toBe(0);
    expect(out.theta).toBe(0);
    expect(Number.isFinite(out.cd)).toBe(true);
  });

  it("rejects physically invalid inputs", () => {
    expect(() => calculate(makeInputs({ dist_km: 0 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ k: 0 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ beta: -0.1 }))).toThrow(RangeError);
    expect(() => calculate(makeInputs({ h_obs: -1 }))).toThrow(RangeError);
  });
});
