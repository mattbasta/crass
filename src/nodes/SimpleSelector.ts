import * as optimization from '../optimization';
import * as utils from '../utils';
import {Selector, OptimizeKeywords} from './Node';

export default class SimpleSelector implements Selector {
  conditions: Array<Selector>;

  constructor(conditions: Array<Selector>) {
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
    this.conditions = await optimization.optimizeList(this.conditions, kw);

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
