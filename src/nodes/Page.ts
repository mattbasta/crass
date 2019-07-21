import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';

export default class Page {
  name: string;
  content: Array<Node>;

  constructor(name: string, content: Array<Node>) {
    this.name = name;
    this.content = content;
  }

  toString() {
    let output = '@page';
    if (this.name) {
      output += ' ' + this.name;
    }
    output += '{';
    output += this.content
      .map((content, i) => {
        const inst = content.toString();
        if (
          content instanceof objects.Declaration &&
          i !== this.content.length - 1
        ) {
          return inst + ';';
        }
        return inst;
      })
      .join('');
    output += '}';
    return output;
  }

  async pretty(indent: number) {
    let output = '';
    output +=
      utils.indent('@page ' + (this.name ? this.name + ' ' : '') + '{') + '\n';
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
    this.content = await optimization.optimizeBlocks(this.content, kw);
    return this;
  }
}
