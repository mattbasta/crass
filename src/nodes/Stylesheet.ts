import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';

export default class Stylesheet implements Node {
  charset: objects.Charset;
  imports: Array<objects.Import>;
  namespaces: Array<objects.Namespace>;
  content: Array<Node>;

  constructor(
    charset: objects.Charset,
    imports: Array<objects.Import>,
    namespaces: Array<objects.Namespace>,
    content: Array<Node>,
  ) {
    this.charset = charset;
    this.imports = imports;
    this.namespaces = namespaces;
    this.content = content;
  }

  toString() {
    let output = '';
    if (this.charset) {
      output += this.charset.toString();
    }
    if (this.imports.length) {
      output += utils.joinAll(this.imports);
    }
    if (this.namespaces.length) {
      output += utils.joinAll(this.namespaces);
    }
    if (this.content.length) {
      output += utils.joinAll(this.content);
    }
    return output;
  }

  async pretty(indent: number = 0) {
    let output = '';
    if (this.charset) {
      output += await this.charset.pretty(indent);
    }
    if (this.imports.length) {
      output += await utils.joinAllAsync(
        this.imports,
        null,
        utils.prettyMap(indent),
      );
    }
    if (this.namespaces.length) {
      output += await utils.joinAllAsync(
        this.namespaces,
        null,
        utils.prettyMap(indent),
      );
    }
    if (this.content.length) {
      output += await utils.joinAllAsync(
        this.content,
        null,
        utils.prettyMap(indent),
      );
    }
    return output;
  }

  async optimize(kw: OptimizeKeywords = {}) {
    if (this.charset) {
      this.charset = (await optimization.try_(
        this.charset,
        kw,
      )) as objects.Charset;
    }
    if (this.imports.length) {
      this.imports = (await optimization.optimizeList(
        this.imports,
        kw,
      )) as Array<objects.Import>;
    }
    if (this.namespaces.length) {
      this.namespaces = (await optimization.optimizeList(
        this.namespaces,
        kw,
      )) as Array<objects.Namespace>;
    }

    // OPT: Remove overridden keyframe blocks
    const keyframeMap: {
      [vendorPrefix: string]: {[keyframeName: string]: number};
    } = {};
    const toRemove = new Set<number>();
    this.content.forEach((x, i) => {
      if (!(x instanceof objects.Keyframes)) {
        return;
      }
      const prefix = x.vendorPrefix || '--';
      if (!(prefix in keyframeMap)) {
        keyframeMap[prefix] = {};
      }
      if (x.name in keyframeMap[prefix]) {
        toRemove.add(keyframeMap[prefix][x.name]);
      }
      keyframeMap[prefix][x.name] = i;
    });
    if (toRemove.size) {
      const ordered = Array.from(toRemove.values()).sort((a, b) => b - a);
      for (let i of ordered) {
        this.content.splice(i, 1);
      }
    }

    const kwKFM: {[vendorPrefix: string]: {[keyframeName: string]: Node}} = {};
    Object.keys(keyframeMap).forEach(prefix => {
      const m = {};
      Object.keys(keyframeMap[prefix]).forEach(name => {
        m[name] = this.content[keyframeMap[prefix][name]];
      });
      kwKFM[prefix] = m;
    });
    kw.keyframeMap = kwKFM;

    this.content = optimization.optimizeBlocks(this.content, kw);

    return this;
  }
}
