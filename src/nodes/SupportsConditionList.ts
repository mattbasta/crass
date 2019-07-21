import * as objects from '../objects';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';

export default class SupportsConditionList implements Node {
  combinator: string;
  conditions: Array<
    objects.SupportsCondition | SupportsConditionList | objects.Declaration
  >;

  constructor(
    combinator: string,
    conditions: Array<
      | objects.SupportsCondition
      | objects.SupportsConditionList
      | objects.Declaration
    >,
  ) {
    this.combinator = combinator;
    this.conditions = conditions;
  }

  unshift(item: objects.SupportsCondition | SupportsConditionList) {
    this.conditions.unshift(item);
  }

  toString(): string {
    return utils.joinAll(this.conditions, ` ${this.combinator} `, item => {
      const output = item.toString();
      return (item instanceof objects.SupportsConditionList &&
        item.combinator !== this.combinator) ||
        item instanceof objects.Declaration
        ? `(${output})`
        : output;
    });
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(
    kw: OptimizeKeywords,
  ): Promise<SupportsConditionList | objects.SupportsCondition> {
    const conditions = await Promise.all(
      this.conditions.map(async condition => condition.optimize(kw)),
    );
    if (conditions.some(condition => condition == null)) {
      throw new Error(
        'Supports condition was optimized away, but should not have.',
      );
    }
    this.conditions = conditions as SupportsConditionList['conditions'];

    // OPT: Remove duplicate delcarations in @supports condition lists
    this.conditions = utils.uniq(utils.stringIdentity, this.conditions);

    // OPT: not(x) and not(y) and not(z) -> not(x or y or z)
    if (
      this.conditions.every(
        cond => cond instanceof objects.SupportsCondition && cond.negated,
      )
    ) {
      const cond = new objects.SupportsCondition(
        new objects.SupportsConditionList(
          this.combinator === 'and' ? 'or' : 'and',
          this.conditions.map(
            condition => (condition as objects.SupportsCondition).condition,
          ),
        ),
      );
      cond.negate();
      return cond;
    }

    return this;
  }
}
