import * as objects from '../objects';
import optimizeList from '../optimizations/optimizeList';
import try_ from '../optimizations/try';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';
import optimizeBlocks from '../optimizations/optimizeBlocks';

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
        undefined,
        utils.prettyMap(indent),
      );
    }
    if (this.namespaces.length) {
      output += await utils.joinAllAsync(
        this.namespaces,
        undefined,
        utils.prettyMap(indent),
      );
    }
    if (this.content.length) {
      output += await utils.joinAllAsync(
        this.content,
        undefined,
        utils.prettyMap(indent),
      );
    }
    return output;
  }

  async optimize(kw: OptimizeKeywords = {}) {
    if (this.charset) {
      this.charset = (await try_(this.charset, kw)) as objects.Charset;
    }
    if (this.imports.length) {
      this.imports = (await optimizeList(this.imports, kw)) as Array<
        objects.Import
      >;
    }
    if (this.namespaces.length) {
      this.namespaces = (await optimizeList(this.namespaces, kw)) as Array<
        objects.Namespace
      >;
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
      const xName = x.name.toString();
      if (xName in keyframeMap[prefix]) {
        toRemove.add(keyframeMap[prefix][xName]);
      }
      keyframeMap[prefix][xName] = i;
    });
    if (toRemove.size) {
      const ordered = Array.from(toRemove.values()).sort((a, b) => b - a);
      for (let i of ordered) {
        this.content.splice(i, 1);
      }
    }

    const kwKFM: {[vendorPrefix: string]: {[keyframeName: string]: Node}} = {};
    Object.keys(keyframeMap).forEach(prefix => {
      const m: {[keyframe: string]: Node} = {};
      Object.keys(keyframeMap[prefix]).forEach(name => {
        m[name] = this.content[keyframeMap[prefix][name]];
      });
      kwKFM[prefix] = m;
    });
    kw.keyframeMap = kwKFM;

    this.content = await optimizeBlocks(this.content, kw);

    return this;
  }
}
