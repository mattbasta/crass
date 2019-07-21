import {Selector, OptimizeKeywords} from './Node';

export default class IDSelector implements Selector {
  ident: string;

  constructor(ident: string) {
    this.ident = ident;
  }

  toString() {
    return '#' + this.ident;
  }

  async pretty(ident: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    if (!kw.saveie && this.ident.includes('#')) {
      return null;
    }
    return this;
  }
}
