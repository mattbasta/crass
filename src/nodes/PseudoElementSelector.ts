import {Selector, OptimizeKeywords} from './Node';

export default class PseudoElementSelector implements Selector {
  ident: string;
  constructor(ident: string) {
    this.ident = ident;
  }

  toString() {
    if (this.ident === 'before' || this.ident === 'after') {
      return ':' + this.ident;
    }
    return '::' + this.ident;
  }

  async pretty(indent: number) {
    return '::' + this.ident;
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase pseudo element names.
    this.ident = this.ident.toLowerCase();
    return this;
  }
}
