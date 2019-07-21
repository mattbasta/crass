import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {OptimizeKeywords} from './Node';

export default class CounterStyle {
  name: string;
  content: Array<objects.Declaration>;

  constructor(name: string, content: Array<objects.Declaration>) {
    this.name = name;
    this.content = content;
  }

  toString() {
    let output = '@counter-style ' + this.name;
    output += '{';
    output += utils.joinAll(this.content, ';');
    output += '}';
    return output;
  }

  async pretty(indent: number) {
    let output = '';
    output += utils.indent('@counter-style ' + this.name + ' {') + '\n';
    output +=
      (await Promise.all(
        this.content.map(async line =>
          utils.indent(await line.pretty(indent + 1), indent),
        ),
      )).join(';\n') + '\n';
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
