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

    const parsedBlob = /(?:\-ms\-)?filter\s*:\s*(.+)/.exec(this.blob);
    if (!parsedBlob) {
      throw new Error(`Could not parse IE filter: ${this.blob}`);
    }

    this.blob = this.ident + ':' + parsedBlob[1];

    return this;
  }
}
