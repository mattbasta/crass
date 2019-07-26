import * as objects from '../objects';
import {OptimizeKeywords, Node} from '../nodes/Node';

// Units to be optimize when using --O1 only.
const opt_unit_o1_only = {
  cm: true,
  mm: true,
  q: true,
  turn: true,
};
const length_units = {
  in: 96,
  px: 1,
  pt: 4 / 3,
  pc: 16,
  cm: 37.79,
  mm: 3.779,
  q: 37.79 / 40, // 1/40 of a cm
};
const angular_units = {
  deg: 1,
  rad: 180 / Math.PI,
  grad: 9 / 10,
  turn: 360,
};
const temporal_units = {
  s: 1000,
  ms: 1,
};
const frequency_units = {
  Hz: 1,
  kHz: 1000,
};
const resolution_units = {
  dpi: 1,
  dpcm: 1 / 2.54,
  dppx: 1 / 96,
};

export default (unit: objects.Dimension, kw: OptimizeKeywords): Node => {
  function optimizeMin(
    unit: objects.Dimension,
    units: {[unit: string]: number},
  ) {
    const versions: {[unit: string]: objects.Dimension} = {};
    const base_unit = units[unit.unit] * unit.number.asNumber();
    let shortest: string | null = null;
    let shortestLen = unit.toString().length;

    for (let i in units) {
      if ((!kw.o1 && i in opt_unit_o1_only) || i === 'turn' || i === unit.unit) {
        continue;
      }
      const temp = (versions[i] = new objects.Dimension(
        new objects.Number(base_unit / units[i]),
        i,
      ));
      if (temp.toString().length < shortestLen) {
        shortest = i;
        shortestLen = temp.toString().length;
      }
    }
    return !shortest ? unit : versions[shortest];
  }

  switch (unit.unit) {
    // Length units
    case 'cm':
    case 'mm':
    case 'q':
      if (!kw.o1) return unit;
    case 'in':
    case 'px':
    case 'pt':
    case 'pc':
      return optimizeMin(unit, length_units);
    // Angular units
    case 'deg':
    case 'rad':
    case 'grad':
    case 'turn':
      return optimizeMin(unit, angular_units);
    // Temporal units
    case 's':
    case 'ms':
      return optimizeMin(unit, temporal_units);
    // Frequency units
    case 'Hz':
    case 'kHz':
      return optimizeMin(unit, frequency_units);
    // Resolution units
    case 'dpi':
    case 'dpcm':
    case 'dppx':
      return optimizeMin(unit, resolution_units);
    default:
      return unit;
  }
};
