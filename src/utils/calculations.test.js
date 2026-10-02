import { describe, it, expect } from 'vitest';
import {
  fermentationData,
  bilinearInterpolate,
  isWithinTestedRange,
  STARTER_PERCENTS,
  TEMPS_F,
  celsiusToFahrenheit,
  convertCtoF,
  convertFtoC,
  splitHours,
  legacyTemperatureToF
} from './calculations.js';

const RISES = [75, 100];

// Every temperature/starter combination the calculator's sliders allow
const sliderTempsF = [];
for (let f = 60; f <= 80; f++) sliderTempsF.push(f);
for (let c = 15; c <= 27; c++) sliderTempsF.push(celsiusToFahrenheit(c));
const sliderStarters = [];
for (let s = 5; s <= 30; s++) sliderStarters.push(s);

describe('bilinearInterpolate', () => {
  it('reproduces every tested data point exactly', () => {
    for (const s of STARTER_PERCENTS) {
      for (const t of TEMPS_F) {
        for (const rise of RISES) {
          expect(bilinearInterpolate(t, s, rise)).toBeCloseTo(fermentationData[s][t][rise], 10);
        }
      }
    }
  });

  it('stays between the surrounding data points inside the grid', () => {
    const time = bilinearInterpolate(69, 12.5, 75);
    const corners = [
      fermentationData[10][68][75], fermentationData[10][70][75],
      fermentationData[15][68][75], fermentationData[15][70][75]
    ];
    expect(time).toBeGreaterThan(Math.min(...corners));
    expect(time).toBeLessThan(Math.max(...corners));
  });

  it('gets slower as the dough gets colder across the whole slider range', () => {
    const temps = [...new Set(sliderTempsF)].sort((a, b) => a - b);
    for (const s of sliderStarters) {
      for (const rise of RISES) {
        for (let i = 1; i < temps.length; i++) {
          expect(bilinearInterpolate(temps[i], s, rise))
            .toBeLessThan(bilinearInterpolate(temps[i - 1], s, rise));
        }
      }
    }
  });

  it('gets faster with more starter across the whole slider range', () => {
    for (const t of sliderTempsF) {
      for (const rise of RISES) {
        for (let i = 1; i < sliderStarters.length; i++) {
          expect(bilinearInterpolate(t, sliderStarters[i], rise))
            .toBeLessThan(bilinearInterpolate(t, sliderStarters[i - 1], rise));
        }
      }
    }
  });

  it('always takes longer to double than to rise 75%', () => {
    for (const t of sliderTempsF) {
      for (const s of sliderStarters) {
        expect(bilinearInterpolate(t, s, 100)).toBeGreaterThan(bilinearInterpolate(t, s, 75));
      }
    }
  });

  it('gives plausible times at the extremes of the sliders', () => {
    expect(bilinearInterpolate(80, 30, 75)).toBeGreaterThan(1);
    expect(bilinearInterpolate(60, 5, 100)).toBeLessThan(30);
  });

  it('is continuous at the edge of the tested range', () => {
    expect(bilinearInterpolate(74.001, 20.001, 100)).toBeCloseTo(fermentationData[20][74][100], 2);
    expect(bilinearInterpolate(65.999, 4.999, 75)).toBeCloseTo(fermentationData[5][66][75], 2);
  });
});

describe('isWithinTestedRange', () => {
  it('accepts the grid bounds and rejects values outside them', () => {
    expect(isWithinTestedRange(66, 5)).toBe(true);
    expect(isWithinTestedRange(74, 20)).toBe(true);
    expect(isWithinTestedRange(65, 10)).toBe(false);
    expect(isWithinTestedRange(70, 25)).toBe(false);
  });
});

describe('temperature conversion', () => {
  it('converts between units', () => {
    expect(convertCtoF(21)).toBe(70);
    expect(convertFtoC(70)).toBe(21);
    expect(celsiusToFahrenheit(21)).toBeCloseTo(69.8);
  });

  it('migrates temperatures saved in either unit to °F', () => {
    expect(legacyTemperatureToF(21)).toBeCloseTo(69.8);
    expect(legacyTemperatureToF(15)).toBeCloseTo(59);
    expect(legacyTemperatureToF(27)).toBeCloseTo(80.6);
    expect(legacyTemperatureToF(60)).toBe(60);
    expect(legacyTemperatureToF(72)).toBe(72);
  });
});

describe('splitHours', () => {
  it('splits fractional hours into hours and minutes', () => {
    expect(splitHours(5.5)).toEqual({ hours: 5, minutes: 30 });
    expect(splitHours(0.25)).toEqual({ hours: 0, minutes: 15 });
  });

  it('rolls 59.5+ minutes over into the next hour', () => {
    expect(splitHours(5.995)).toEqual({ hours: 6, minutes: 0 });
  });
});
