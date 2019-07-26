import optimizeList from '../optimizations/optimizeList';
import {OptimizeKeywords, TerminalSelector, SelectorCondition} from './Node';
import * as utils from '../utils';

export default class SimpleSelector implements TerminalSelector {
  conditions: Array<SelectorCondition>;

  constructor(conditions: Array<SelectorCondition>) {
    this.conditions = conditions;
  }

  toString() {
    return utils.joinAll(this.conditions);
  }

  async pretty(indent: number) {
    return utils.joinAllAsync(
      this.conditions,
      undefined,
      utils.prettyMap(indent),
    );
  }

  async optimize(kw: OptimizeKeywords) {
    this.conditions = await optimizeList(this.conditions, kw);

    if (!this.conditions.length || this.conditions.some(x => x === null)) {
      return null;
    }

    // OPT: Remove duplicate conditions from a simple selector.
    this.conditions = utils.uniq(utils.stringIdentity, this.conditions);

    // OPT(O1): Remove unnecessary wildcard selectors
    if (kw.o1 && this.conditions.length > 1) {
      this.conditions = this.conditions.filter(i => i.toString() !== '*');
    }
    return this;
  }
}
