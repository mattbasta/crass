import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';

export default class FontFace implements Node {
  content: Array<objects.Declaration>;

  constructor(content: Array<objects.Declaration>) {
    this.content = content;
  }

  toString() {
    return '@font-face{' + utils.joinAll(this.content, ';') + '}';
  }

  async pretty(indent: number) {
    let output = '';
    output += utils.indent('@font-face {') + '\n';
    output +=
      (await Promise.all(
        this.content.map(async line =>
          utils.indent((await line.pretty(indent + 1)) + ';', indent + 1),
        ),
      )).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
  }

  async optimize(kw: OptimizeKeywords) {
    this.content = await optimization.optimizeDeclarations(this.content, kw);
    if (!this.content.length) {
      return null;
    }
    return this;
  }
}
