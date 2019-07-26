import {Block, OptimizeKeywords} from './Node';
import * as objects from '../objects';
import * as utils from '../utils';
import optimizeDeclarations from '../optimizations/optimizeDeclarations';

export default class Viewport implements Block {
  content: Array<objects.Declaration>;
  vendorPrefix: string | null;

  constructor(
    content: Array<objects.Declaration>,
    vendorPrefix: string | null = null,
  ) {
    this.content = content;
    this.vendorPrefix = vendorPrefix;
  }

  getBlockHeader() {
    return this.vendorPrefix
      ? '@' + this.vendorPrefix + 'viewport'
      : '@viewport';
  }

  toString() {
    let output = this.getBlockHeader();
    output += '{';
    output += utils.joinAll(this.content, ';');
    output += '}';
    return output;
  }

  async pretty(indent: number) {
    let output = '';
    output += utils.indent(this.getBlockHeader() + ' {') + '\n';
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
    let oldPrefix;
    if (this.vendorPrefix) {
      oldPrefix = kw.vendorPrefix;
      kw.vendorPrefix = this.vendorPrefix;
    }

    this.content = await optimizeDeclarations(this.content, kw);
    kw.vendorPrefix = oldPrefix;

    if (!this.content.length) {
      return null;
    }

    return this;
  }
}
