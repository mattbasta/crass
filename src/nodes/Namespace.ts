import {Node, OptimizeKeywords} from './Node';
import * as objects from '../objects';

export default class Namespace implements Node {
  namespaceURI: objects.URI;
  prefix: string;

  constructor(namespaceURI: objects.URI, prefix: string) {
    this.namespaceURI = namespaceURI;
    this.prefix = prefix;
  }

  toString() {
    if (this.prefix) {
      return (
        '@namespace ' + this.prefix + ' ' + this.namespaceURI.toString() + ';'
      );
    } else {
      return '@namespace ' + this.namespaceURI.toString() + ';';
    }
  }

  async pretty(indent: number) {
    return this.toString() + '\n';
  }

  async optimize(kw: OptimizeKeywords) {
    return this;
  }
}
