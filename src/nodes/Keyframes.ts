const browserSupport = require('../browser_support');
import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Block, Node, OptimizeKeywords} from './Node';

export default class Keyframes implements Block {
  name: string;
  content: Array<objects.Keyframe>;
  vendorPrefix: string | null;

  constructor(
    name: string,
    content: Array<objects.Keyframe>,
    vendorPrefix: string | null,
  ) {
    this.name = name;
    this.content = content;
    this.vendorPrefix = vendorPrefix;
  }

  getBlockHeader() {
    return this.vendorPrefix
      ? '@' + this.vendorPrefix + 'keyframes '
      : '@keyframes ';
  }

  toString() {
    let output = this.getBlockHeader();
    output += this.name;
    output += '{';
    output += utils.joinAll(this.content);
    output += '}';
    return output;
  }

  async pretty(indent: number) {
    let output = '';
    output += utils.indent(this.getBlockHeader() + this.name + ' {') + '\n';
    output +=
      (await Promise.all(
        this.content.map(async line =>
          utils.indent(await line.pretty(indent + 1), indent),
        ),
      )).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Remove unsupported keyframes blocks.
    if (!browserSupport.supportsKeyframe(this.vendorPrefix, kw)) {
      return null;
    }

    kw.insideKeyframes = this.name;

    if (this.vendorPrefix) {
      kw.vendorPrefix = this.vendorPrefix;
    }

    // OPT: Combine keyframes with identical stops.
    this.content = optimization.combineList(
      item => item.stop.toString(),
      (a, b) => new objects.Keyframe(a.stop, a.content.concat(b.content)),
      this.content,
    );
    // OPT: Sort keyframes.
    this.content = this.content.sort(function(a, b) {
      return a.stop.toString().localeCompare(b.stop.toString());
    });

    this.content = (await optimization.optimizeList(this.content, kw)) as Array<
      objects.Keyframe
    >;

    // OPT: Combine duplicate keyframes
    const cache = {};
    this.content = this.content.reduce((a, b) => {
      const content = b.content.toString();
      if (content in cache) {
        cache[content].stop = cache[content].stop.concat(b.stop);
        return a;
      }
      cache[content] = b;
      a.push(b);
      return a;
    }, []);

    delete kw.vendorPrefix;
    delete kw.insideKeyframes;

    return this;
  }
}
