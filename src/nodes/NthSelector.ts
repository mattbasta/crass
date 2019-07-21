import * as objects from '../objects';
import * as optimization from '../optimization';
import {Selector, OptimizeKeywords} from './Node';

export default class NthSelector implements Selector {
  funcName: string;
  linearFunc: objects.LinearFunction | string;

  constructor(funcName: string, linearFunc: objects.LinearFunction | string) {
    this.funcName = funcName;
    this.linearFunc = linearFunc;
  }

  toString() {
    return ':' + this.funcName + '(' + this.linearFunc.toString() + ')';
  }

  async pretty(indent: number) {
    const lfPretty =
      typeof this.linearFunc === 'string'
        ? this.linearFunc
        : await this.linearFunc.pretty(indent);
    return ':' + this.funcName + '(' + lfPretty + ')';
  }

  async optimize(kw: OptimizeKeywords) {
    if (typeof this.linearFunc !== 'string') {
      this.linearFunc = (await optimization.try_(
        this.linearFunc,
        kw,
      )) as objects.LinearFunction;
    }

    // OPT: nth-selectors (2n+1) to (odd)
    if (this.linearFunc.toString() === '2n+1') {
      return new objects.NthSelector(this.funcName, 'odd');
    }

    return this;
  }
}
