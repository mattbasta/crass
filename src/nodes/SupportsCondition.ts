import * as objects from '../objects';

export default class SupportsCondition {
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

  async optimize(kw) {
    this.condition = await this.condition.optimize(kw);
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
