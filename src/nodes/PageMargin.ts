import * as objects from '../objects';
import * as utils from '../utils';
import {OptimizeKeywords} from './Node';
import optimizeDeclarations from '../optimizations/optimizeDeclarations';

export default class PageMargin {
  margin: string;
  content: Array<objects.Declaration>;

  constructor(margin: string, content: Array<objects.Declaration>) {
    this.margin = margin;
    this.content = content;
  }

  toString() {
    return '@' + this.margin + '{' + utils.joinAll(this.content) + '}';
  }

  async pretty(indent: number) {
    let output = '';
    output += utils.indent('@' + this.margin + ' {') + '\n';
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
    this.content = await optimizeDeclarations(this.content, kw);
    return this;
  }
}
