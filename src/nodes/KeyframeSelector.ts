import {Node, OptimizeKeywords} from './Node';

export default class KeyframeSelector implements Node {
  stop: string;

  constructor(stop: string) {
    this.stop = stop;
  }

  toString() {
    return this.stop;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Convert 'from' to 0%
    if (this.stop === 'from') {
      this.stop = '0%';
    } else if (this.stop === '100%') {
      this.stop = 'to';
    }
    return this;
  }
}
