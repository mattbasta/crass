import {Node, OptimizeKeywords} from './Node';

export default class CustomIdent implements Node {
  idents: Array<string>;

  constructor(idents: Array<string>) {
    this.idents = idents;
  }

  toString() {
    return '[' + this.idents.join(' ') + ']';
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    return this;
  }
}
