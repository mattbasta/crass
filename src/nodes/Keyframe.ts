import * as objects from '../objects';
import optimizeList from '../optimizations/optimizeList';
import * as utils from '../utils';
import {OptimizeKeywords, Node} from './Node';
import optimizeDeclarations from '../optimizations/optimizeDeclarations';

export default class Keyframe implements Node {
  stop: Array<objects.KeyframeSelector>;
  content: Array<objects.Declaration>;

  constructor(
    stop: Array<objects.KeyframeSelector>,
    content: Array<objects.Declaration>,
  ) {
    this.stop = stop;
    this.content = content;
  }

  toString() {
    return utils.joinAll(this.stop, ',') + '{' + this.toStringBody() + '}';
  }

  toStringBody() {
    return utils.joinAll(this.content, ';');
  }

  async pretty(indent: number) {
    let output = '';
    output +=
      utils.indent(
        (await utils.joinAllAsync(this.stop, ', ', async x =>
          x.pretty(indent),
        )) + ' {',
        indent,
      ) + '\n';
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
    this.stop = (await optimizeList(this.stop, kw)) as Array<
      objects.KeyframeSelector
    >;
    this.content = await optimizeDeclarations(this.content, kw);
    return this;
  }
}
