import {NumberableExpression, OptimizeKeywords} from './Node';
import * as objects from '../objects';
import try_ from '../optimizations/try';

export default class LinearFunction {
  nValue: objects.NValue;
  offset: NumberableExpression;

  constructor(nValue: objects.NValue, offset: NumberableExpression) {
    this.nValue = nValue;
    this.offset = offset;
  }

  toString() {
    if (this.nValue) {
      const operator = this.offset.asNumber() < 0 ? '-' : '+';
      return (
        this.nValue.toString() + operator + this.offset.asUnsigned().toString()
      );
    } else {
      return this.offset.toString();
    }
  }

  async pretty(indent: number) {
    if (this.nValue) {
      const operator = this.offset.asNumber() < 0 ? ' - ' : ' + ';
      return (
        this.nValue.toString() + operator + this.offset.asUnsigned().toString()
      );
    } else {
      return this.offset.toString();
    }
  }

  async optimize(kw: OptimizeKeywords) {
    this.nValue = (await try_(this.nValue, kw)) as objects.NValue;
    return this;
  }
}
