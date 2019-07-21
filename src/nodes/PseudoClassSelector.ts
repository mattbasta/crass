import {Selector, OptimizeKeywords} from './Node';

export default class PseudoClassSelector implements Selector {
  ident: string;

  constructor(ident: string) {
    this.ident = ident;
  }

  toString() {
    return ':' + this.ident;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase pseudo element names.
    this.ident = this.ident.toLowerCase();
    return this;
  }
}
