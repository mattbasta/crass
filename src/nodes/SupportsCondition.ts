import * as objects from '../objects';
import {OptimizeKeywords, Node} from './Node';

export default class SupportsCondition implements Node {
  condition:
    | objects.Declaration
    | objects.SupportsConditionList
    | objects.SupportsCondition;
  negated: boolean;

  constructor(condition: objects.Declaration | objects.SupportsConditionList) {
    this.condition = condition;
    this.negated = false;
  }

  negate() {
    this.negated = !this.negated;
  }

  toString() {
    let output = '';
    if (this.negated) {
      output = 'not ';
    }
    output += '(';
    output += this.condition;
    output += ')';
    return output;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords): Promise<Node | null> {
    const condition = await this.condition.optimize(kw);
    if (!condition) {
      return null;
    }
    this.condition = condition as SupportsCondition['condition'];

    // OPT: not(not(foo:bar)) -> (foo:bar)
    if (
      this.condition instanceof objects.SupportsCondition &&
      this.negated &&
      this.condition.negated
    ) {
      this.condition.negate();
      return this.condition;
    }
    return this;
  }
}
