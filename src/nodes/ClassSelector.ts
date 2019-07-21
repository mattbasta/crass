import {Selector, OptimizeKeywords} from './Node';

export default class ClassSelector implements Selector {
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
