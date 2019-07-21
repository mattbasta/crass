import * as optimization from '../optimization';
import {Selector, Expression, OptimizeKeywords} from './Node';

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
    this.expr = await optimization.try_(this.expr, kw);
    return this;
  }
}
