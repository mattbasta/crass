import {OptimizeKeywords, SelectorCondition} from './Node';

export default class ClassSelector implements SelectorCondition {
  ident: string;

  constructor(ident: string) {
    this.ident = ident;
  }

  toString() {
    return '.' + this.ident;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    return this;
  }
}
