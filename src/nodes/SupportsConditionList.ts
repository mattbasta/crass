import * as objects from '../objects';
import * as utils from '../utils';
import {Node} from './Node';

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

  unshift(item: objects.SupportsCondition) {
    this.conditions.unshift(item);
  }

  toString() {
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
    kw,
  ): Promise<SupportsConditionList | objects.SupportsCondition> {
    this.conditions = await Promise.all(
      this.conditions.map(async condition => condition.optimize(kw)),
    );

    // OPT: Remove duplicate delcarations in @supports condition lists
    this.conditions = utils.uniq(null, this.conditions);

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
