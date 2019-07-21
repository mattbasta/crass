import {Node, OptimizeKeywords} from './Node';

export default class IEFilter implements Node {
  ident: string;
  blob: string;

  constructor(blob: string) {
    this.ident = 'filter'; // Hack so that we can duck-type this as a Declaration.
    if (blob[0] === '-') {
      this.ident = '-ms-filter';
    }
    this.blob = blob;
  }

  toString() {
    return this.blob;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    if (kw.browser_min && kw.browser_min.ie && kw.browser_min.ie > 9) {
      return null;
    }

    this.blob =
      this.ident + ':' + /(?:\-ms\-)?filter\s*:\s*(.+)/.exec(this.blob)[1];

    return this;
  }
}
