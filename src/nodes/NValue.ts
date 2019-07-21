import {Expression, NumberableExpression, OptimizeKeywords} from './Node';

export default class NValue implements Expression {
  coefficient: NumberableExpression;

  constructor(coefficient: NumberableExpression) {
    this.coefficient = coefficient;
  }

  toString() {
    const coef = this.coefficient.asNumber();
    if (coef === 1) {
      return 'n';
    } else if (!coef) {
      return '0';
    } else {
      return coef.toString() + 'n';
    }
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    return this;
  }
}
