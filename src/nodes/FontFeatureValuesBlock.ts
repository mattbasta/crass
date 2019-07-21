import * as optimization from '../optimization';
import * as utils from '../utils';
import {Block, Node, OptimizeKeywords} from './Node';

export default class FontFeatureValuesBlock implements Block {
  blockName: string;
  content: Array<Node>;

  constructor(blockName: string, content: Array<Node>) {
    this.blockName = blockName;
    this.content = content;
  }

  getBlockHeader() {
    return this.blockName;
  }

  toString() {
    return this.blockName + '{' + utils.joinAll(this.content, ';') + '}';
  }

  async pretty(indent: number) {
    let output = '';
    output += utils.indent(this.blockName + ' {') + '\n';
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
    return this;
  }
}
