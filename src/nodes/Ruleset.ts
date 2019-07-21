import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Node, OptimizeKeywords, Selector} from './Node';

export default class Ruleset implements Node {
  selector: objects.SelectorList | Selector;
  content: Array<objects.Declaration>;

  constructor(
    selector: objects.SelectorList,
    content: Array<objects.Declaration>,
  ) {
    this.selector = selector;
    this.content = content;
  }

  contentToString() {
    return utils.joinAll(this.content, ';');
  }

  /**
   * Finds the intersection of declarations between this ruleset and the set of
   * declarations for a provided ruleset.
   */
  declarationIntersections(ruleset: Ruleset) {
    const localDeclarations = this.content.reduce((acc, cur) => {
      acc[cur.ident] = cur;
      return acc;
    }, {});
    const intersection = [];
    for (let i = 0; i < ruleset.content.length; i++) {
      const foreignDecl = ruleset.content[i];
      if (localDeclarations.hasOwnProperty(foreignDecl.ident)) {
        const localDecl = localDeclarations[foreignDecl.ident];
        if (localDecl.important === foreignDecl.important) {
          intersection.push(foreignDecl.ident);
        }
      }
    }
    return intersection;
  }

  /**
   * Removes a declaration with the provided name from the ruleset
   */
  removeDeclaration(name: string) {
    this.content = this.content.filter(decl => decl.ident !== name);
  }

  toString() {
    return this.selector.toString() + '{' + this.contentToString() + '}';
  }

  async pretty(indent: number) {
    let output = '';
    output +=
      utils.indent((await this.selector.pretty(indent)) + ' {', indent) + '\n';

    const content = this.content.map(async line =>
      utils.indent((await line.pretty(indent + 1)) + ';', indent + 1),
    );
    output += (await Promise.all(content)).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
  }

  async optimizeContent(kw: OptimizeKeywords) {
    this.content = await optimization.optimizeDeclarations(this.content, kw);
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Ignore `* html` hacks from IE6
    if (
      !kw.saveie &&
      // Ignore selector lists, which handle this case separately
      !(this.selector instanceof objects.SelectorList) &&
      /\* html($| .+)/.exec(this.selector.toString())
    ) {
      return null;
    }

    this.selector = await optimization.try_(this.selector, kw);
    if (!this.selector) {
      return null;
    }

    await this.optimizeContent(kw);

    // OPT: Remove empty rulsets.
    if (!this.content.length) {
      return null;
    }
    return this;
  }
}
