import * as objects from '../objects';
import * as utils from '../utils';
import {OptimizeKeywords} from './Node';
import optimizeBlocks from '../optimizations/optimizeBlocks';

export default class FontFeatureValues {
  fontName: objects.Identifier;
  content: Array<objects.FontFeatureValuesBlock>;

  constructor(
    fontName: objects.Identifier,
    content: Array<objects.FontFeatureValuesBlock>,
  ) {
    this.fontName = fontName;
    this.content = content;
  }

  toString() {
    return `@font-feature-values ${this.fontName}{${utils.joinAll(
      this.content,
    )}}`;
  }

  async pretty(indent: number) {
    let output = '';
    output +=
      utils.indent('@font-feature-values ' + this.fontName + ' {') + '\n';
    output +=
      (await Promise.all(
        this.content.map(async line =>
          utils.indent(await line.pretty(indent + 1), indent + 1),
        ),
      )).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
  }

  async optimize(kw: OptimizeKeywords) {
    this.content = await optimizeBlocks(this.content, kw);
    if (!this.content.length) {
      return null;
    }
    return this;
  }
}
