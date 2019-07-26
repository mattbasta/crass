import {Node, OptimizeKeywords} from './Node';

export default class Identifier implements Node {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString() {
    return this.value;
  }

  async pretty(indent: number) {
    return this.value;
  }

  async optimize(kw: OptimizeKeywords) {
    return this;
  }
}
