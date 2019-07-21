import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Node, Selector, OptimizeKeywords} from './Node';

export default class SelectorList implements Node {
  selectors: Array<Selector>;

  constructor(selectors: Array<Selector>) {
    this.selectors = selectors;
  }

  push(selector: Selector) {
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
    this.selectors = await optimization.optimizeList(this.selectors, kw);

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
    this.selectors = utils.uniq(null, this.selectors);

    this.selectors = this.selectors.filter(x => x);
    if (!this.selectors.length) {
      return null;
    }

    // TODO(opt): Merge selectors.
    return this;
  }
}
