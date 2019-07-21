import {Node} from './Node';

export default class Charset implements Node {
  charset: string;

  constructor(charset: string) {
    this.charset = charset;
  }

  toString() {
    return `@charset ${this.charset};`;
  }

  async pretty(indent: number) {
    return this.toString() + '\n';
  }

  async optimize() {
    return this;
  }
}
