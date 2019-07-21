import {NumberableExpression, OptimizeKeywords} from './Node';
import * as objects from '../objects';
import * as optimization from '../optimization';

const LENGTH_UNITS = new Set([
  'cap',
  'ch',
  'em',
  'ex',
  'ic',
  'lh',
  'rem',
  'rlh',
  'vh',
  'vw',
  'vi',
  'vb',
  'vmin',
  'vmax',
  'px',
  'mm',
  'q',
  'cm',
  'in',
  'pt',
  'pc',
  'mozmm',
]);

const declsToNotOptimizePercents = {
  height: true,
  width: true,
  flex: true,
  'flex-basis': true,
};

export default class Dimension implements NumberableExpression {
  number: objects.Number;
  unit: string;

  constructor(number: objects.Number, unit?: string) {
    this.number = number;
    this.unit = unit || '';
  }

  asNumber() {
    return this.number.asNumber();
  }
  asUnsigned() {
    return this.number.asUnsigned();
  }

  toString() {
    if (
      Math.abs(this.number.value) === 0 &&
      this.unit !== '%' &&
      LENGTH_UNITS.has(this.unit)
    ) {
      return '0';
    } else {
      return this.number.toString() + this.unit;
    }
  }

  async pretty(indent: number) {
    return (await this.number.pretty(indent)) + this.unit;
  }

  async optimize(kw: OptimizeKeywords) {
    if (!this.unit) {
      return this.number;
    }
    if (
      kw.func !== 'hsl' &&
      kw.func !== 'hsla' &&
      Math.abs(this.number.value) === 0 &&
      !(kw.declarationName in declsToNotOptimizePercents) &&
      LENGTH_UNITS.has(this.unit)
    ) {
      return this.number;
    }
    return optimization.unit(this, kw);
  }
}
