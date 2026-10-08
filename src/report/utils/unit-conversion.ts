import { cmToPoints } from './cm-to-points.js';

export const unitConversion = (value: number, unit: 'cm' | 'pt') => {
  if (unit === 'cm') {
    return cmToPoints(value);
  }

  return value;
};
