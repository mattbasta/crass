import {Selector, Expression, OptimizeKeywords} from './Node';
import try_ from '../optimizations/try';

export default class PseudoSelectorFunction implements Selector {
  funcName: string;
  expr: Expression;

  constructor(funcName: string, expr: Expression) {
    this.funcName = funcName;
    this.expr = expr;
  }

  toString() {
    return `:${this.funcName}(${this.expr.toString()})`;
  }

  async pretty(indent: number) {
    return `:${this.funcName}(${await this.expr.pretty(indent)})`;
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase pseudo function names.
    this.funcName = this.funcName.toLowerCase();
    const expr = await try_(this.expr, kw);
    if (!expr) {
      return null;
    }
    this.expr = expr;
    return this;
  }
}
