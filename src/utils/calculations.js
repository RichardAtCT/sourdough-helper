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

export const bilinearInterpolate = (temp, starter, rise) => {
  // Find surrounding starter percentages
  const starters = [5, 10, 15, 20];
  let s1 = starters[0], s2 = starters[starters.length - 1];
  for (let i = 0; i < starters.length - 1; i++) {
    if (starter >= starters[i] && starter <= starters[i + 1]) {
      s1 = starters[i];
      s2 = starters[i + 1];
      break;
    }
  }

  // Find surrounding temperatures
  const temps = [66, 68, 70, 72, 74];
  let t1 = temps[0], t2 = temps[temps.length - 1];
  for (let i = 0; i < temps.length - 1; i++) {
    if (temp >= temps[i] && temp <= temps[i + 1]) {
      t1 = temps[i];
      t2 = temps[i + 1];
      break;
    }
  }

  // Get corner values
  const q11 = fermentationData[s1]?.[t1]?.[rise] || 8;
  const q21 = fermentationData[s2]?.[t1]?.[rise] || 8;
  const q12 = fermentationData[s1]?.[t2]?.[rise] || 8;
  const q22 = fermentationData[s2]?.[t2]?.[rise] || 8;

  // Interpolate
  const wx = (temp - t1) / (t2 - t1 || 1);
  const wy = (starter - s1) / (s2 - s1 || 1);

  const time = q11 * (1 - wx) * (1 - wy) +
               q21 * wx * (1 - wy) +
               q12 * (1 - wx) * wy +
               q22 * wx * wy;

  return time;
};

export const convertFtoC = (tempF) => {
  return Math.round((tempF - 32) * 5 / 9);
};

export const convertCtoF = (tempC) => {
  return Math.round(tempC * 9 / 5 + 32);
};

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

export const calculateCompletionTime = (startTime, estimatedHours) => {
  if (!startTime) return null;
  const start = new Date(startTime);
  const completion = new Date(start.getTime() + estimatedHours * 3600000);
  return completion;
};
