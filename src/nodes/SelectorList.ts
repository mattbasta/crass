import {Node, OptimizeKeywords, TreeSelector} from './Node';
import optimizeList from '../optimizations/optimizeList';
import * as utils from '../utils';

export default class SelectorList implements Node {
  selectors: Array<TreeSelector>;

  constructor(selectors: Array<TreeSelector>) {
    this.selectors = selectors;
  }

  push(selector: TreeSelector) {
    this.selectors.push(selector);
  }

  toString() {
    return utils.joinAll(this.selectors, ',');
  }

  async pretty(indent: number) {
    const separator =
      this.toString().length < 80
        ? ', '
        : ',\n' + utils.indent(' ', indent).substr(1);
    return utils.joinAllAsync(
      this.selectors,
      separator,
      utils.prettyMap(indent),
    );
  }

  async optimize(kw: OptimizeKeywords) {
    this.selectors = await optimizeList(this.selectors, kw);

    // OPT: Ignore `* html` hacks from IE6
    if (!kw.saveie) {
      this.selectors = this.selectors.filter(
        s => !/\* html($| .+)/.exec(s.toString()),
      );
    }

    // OPT: Sort selector lists.
    this.selectors = this.selectors.sort((a, b) =>
      a.toString() < b.toString() ? -1 : 1,
    );
    // OPT: Remove duplicate selectors in a selector list.
    this.selectors = utils.uniq(utils.stringIdentity, this.selectors);

    this.selectors = this.selectors.filter(x => x);
    if (!this.selectors.length) {
      return null;
    }

    // TODO(opt): Merge selectors.
    return this;
  }
}
