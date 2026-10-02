// Fermentation calculations and data

export const fermentationData = {
  5: {
    66: { 75: 12.5, 100: 14.5 },
    68: { 75: 10.5, 100: 12.0 },
    70: { 75: 9.0, 100: 10.5 },
    72: { 75: 7.5, 100: 9.0 },
    74: { 75: 6.5, 100: 7.5 }
  },
  10: {
    66: { 75: 10.0, 100: 11.5 },
    68: { 75: 8.5, 100: 9.5 },
    70: { 75: 7.0, 100: 8.5 },
    72: { 75: 6.0, 100: 7.0 },
    74: { 75: 5.0, 100: 6.0 }
  },
  15: {
    66: { 75: 8.5, 100: 9.5 },
    68: { 75: 7.0, 100: 8.0 },
    70: { 75: 6.0, 100: 7.0 },
    72: { 75: 5.0, 100: 6.0 },
    74: { 75: 4.0, 100: 5.0 }
  },
  20: {
    66: { 75: 7.0, 100: 8.0 },
    68: { 75: 6.0, 100: 7.0 },
    70: { 75: 5.0, 100: 6.0 },
    72: { 75: 4.0, 100: 5.0 },
    74: { 75: 3.5, 100: 4.0 }
  }
};

export const STARTER_PERCENTS = [5, 10, 15, 20];
export const TEMPS_F = [66, 68, 70, 72, 74];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Index of the grid segment containing a value already clamped to the grid
const segmentIndex = (grid, value) => {
  for (let i = 0; i < grid.length - 2; i++) {
    if (value <= grid[i + 1]) return i;
  }
  return grid.length - 2;
};

const logTimeAt = (starter, temp, rise) => Math.log(fermentationData[starter][temp][rise]);

// Bilinear interpolation of log(time) inside the tested grid
const interpolateInGrid = (temp, starter, rise) => {
  const si = segmentIndex(STARTER_PERCENTS, starter);
  const ti = segmentIndex(TEMPS_F, temp);
  const s1 = STARTER_PERCENTS[si], s2 = STARTER_PERCENTS[si + 1];
  const t1 = TEMPS_F[ti], t2 = TEMPS_F[ti + 1];

  const wt = (temp - t1) / (t2 - t1);
  const ws = (starter - s1) / (s2 - s1);

  return logTimeAt(s1, t1, rise) * (1 - wt) * (1 - ws) +
         logTimeAt(s1, t2, rise) * wt * (1 - ws) +
         logTimeAt(s2, t1, rise) * (1 - wt) * ws +
         logTimeAt(s2, t2, rise) * wt * ws;
};

// Estimated fermentation time in hours. Interpolates log(time), since
// fermentation time falls roughly exponentially with temperature and starter;
// every data point is reproduced exactly. Outside the tested grid the estimate
// continues the grid's overall exponential trend along each axis, so it stays
// positive and keeps the right direction (colder or less starter = slower).
export const bilinearInterpolate = (temp, starter, rise) => {
  const tMin = TEMPS_F[0], tMax = TEMPS_F[TEMPS_F.length - 1];
  const sMin = STARTER_PERCENTS[0], sMax = STARTER_PERCENTS[STARTER_PERCENTS.length - 1];
  const tc = clamp(temp, tMin, tMax);
  const sc = clamp(starter, sMin, sMax);

  // Average log-slope across the whole grid along each axis
  const tempSlope = (interpolateInGrid(tMax, sc, rise) - interpolateInGrid(tMin, sc, rise)) / (tMax - tMin);
  const starterSlope = (interpolateInGrid(tc, sMax, rise) - interpolateInGrid(tc, sMin, rise)) / (sMax - sMin);

  return Math.exp(
    interpolateInGrid(tc, sc, rise) +
    tempSlope * (temp - tc) +
    starterSlope * (starter - sc)
  );
};

export const isWithinTestedRange = (tempF, starter) =>
  tempF >= TEMPS_F[0] && tempF <= TEMPS_F[TEMPS_F.length - 1] &&
  starter >= STARTER_PERCENTS[0] && starter <= STARTER_PERCENTS[STARTER_PERCENTS.length - 1];

export const convertFtoC = (tempF) => {
  return Math.round((tempF - 32) * 5 / 9);
};

export const convertCtoF = (tempC) => {
  return Math.round(tempC * 9 / 5 + 32);
};

// Unrounded conversion, for calculations where whole-degree rounding loses precision
export const celsiusToFahrenheit = (tempC) => tempC * 9 / 5 + 32;

export const calculateWaterAmount = (baseWater, hydration, yeastType) => {
  // Adjust water based on hydration percentage
  const adjustedWater = baseWater * (hydration / 80); // 80% is base

  // Reduce water slightly when using commercial yeast (it's drier)
  if (yeastType === 'commercial') {
    return Math.round(adjustedWater * 0.98);
  }

  return Math.round(adjustedWater);
};

export const calculateYeastAmount = (fermentationTime, yeastType, baseAmount = 100) => {
  // Exponential decay model for yeast/starter amount
  // Longer fermentation = less yeast needed

  if (yeastType === 'sourdough') {
    // Sourdough starter percentage (of flour weight)
    // 12 hours = 100g, 72 hours = 25g
    const minAmount = 25;
    const maxAmount = 100;
    const k = Math.log(maxAmount / minAmount) / (72 - 12);
    return Math.round(maxAmount * Math.exp(-k * (fermentationTime - 12)));
  } else {
    // Commercial yeast in grams
    // 12 hours = 2g, 72 hours = 0.5g
    const minAmount = 0.5;
    const maxAmount = 2;
    const k = Math.log(maxAmount / minAmount) / (72 - 12);
    return Math.round(maxAmount * Math.exp(-k * (fermentationTime - 12)) * 10) / 10;
  }
};

// Splits fractional hours into whole hours and minutes, never yielding 60 minutes
export const splitHours = (fractionalHours) => {
  const totalMinutes = Math.round(fractionalHours * 60);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
};

export const calculateCompletionTime = (startTime, estimatedHours) => {
  if (!startTime) return null;
  const start = new Date(startTime);
  const completion = new Date(start.getTime() + estimatedHours * 3600000);
  return completion;
};
