import {OptimizeKeywords, SelectorCondition} from './Node';

export default class ElementSelector implements SelectorCondition {
  ident: string;
  ns: string | null;

  constructor(ident: string, ns: string | null) {
    this.ident = ident;
    this.ns = ns;
  }

  toString() {
    if (this.ident && this.ns) {
      return this.ident + '|' + this.ns;
    } else if (this.ns) {
      return '|' + this.ns;
    } else {
      return this.ident;
    }
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase element names.
    this.ident = this.ident.toLowerCase();
    if (this.ns) {
      this.ns = this.ns.toLowerCase();
    }
    return this;
  }
}
