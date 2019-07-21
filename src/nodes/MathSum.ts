import * as objects from '../objects';
import {Expression, OptimizeKeywords, Node} from './Node';
import unitTypes from './helpers/unitTypes';

export default class MathSum implements Expression {
  base: Expression;
  operator: string;
  term: Expression;

  constructor(base: Expression, operator: string, term: Expression) {
    this.base = base;
    this.operator = operator;
    this.term = term;
  }

  toStringWithFlippedSign() {
    let output = `${this.base.toString()} `;
    if (this.operator === '+') {
      output += '-';
    } else {
      output += '+';
    }
    output += ' ';

    if (this.term instanceof MathSum) {
      output +=
        this.operator === '-'
          ? this.term.toStringWithFlippedSign()
          : this.term.toString();
    } else {
      output += this.term.toString();
    }

    return output;
  }

  toString() {
    return `${this.base.toString()} ${this.operator} ${this.term.toString()}`;
  }

  async pretty(indent: number) {
    let output = '';
    output += await this.base.pretty(indent);
    output += ' ';
    output += this.operator;
    output += ' ';
    output += await this.term.pretty(indent);
    return output;
  }

  async optimize(kw: OptimizeKeywords): Promise<Node | null> {
    this.base = (await this.base.optimize(kw))!;
    this.term = (await this.term.optimize(kw))!;

    if (!this.base || !this.term) {
      return null;
    }

    // OPT: Try to collapse MathSum expressions
    if (
      this.base instanceof MathSum &&
      this.term instanceof objects.Dimension
    ) {
      if (
        this.base.base instanceof objects.Dimension &&
        this.base.base.unit === this.term.unit
      ) {
        if (this.operator === '+') {
          return new MathSum(
            new objects.Dimension(
              new objects.Number(
                this.base.base.asNumber() + this.term.asNumber(),
              ),
              this.term.unit,
            ),
            this.base.operator,
            this.base.term,
          );
        } else {
          return new MathSum(
            new objects.Dimension(
              new objects.Number(
                this.base.base.asNumber() - this.term.asNumber(),
              ),
              this.term.unit,
            ),
            this.base.operator,
            this.base.term,
          );
        }
      } else if (
        this.base.term instanceof objects.Dimension &&
        this.base.term.unit === this.term.unit
      ) {
        if (this.operator === '+') {
          return new MathSum(
            this.base.base,
            this.base.operator,
            new objects.Dimension(
              new objects.Number(
                this.base.operator === '+'
                  ? this.base.term.asNumber() + this.term.asNumber()
                  : this.base.term.asNumber() - this.term.asNumber(),
              ),
              this.term.unit,
            ),
          );
        } else {
          return new MathSum(
            this.base.base,
            this.base.operator,
            new objects.Dimension(
              new objects.Number(
                this.base.operator === '+'
                  ? this.base.term.asNumber() - this.term.asNumber()
                  : this.base.term.asNumber() + this.term.asNumber(),
              ),
              this.term.unit,
            ),
          );
        }
      }
    } else if (
      this.term instanceof MathSum &&
      this.base instanceof objects.Dimension
    ) {
      if (
        this.term.base instanceof objects.Dimension &&
        this.term.base.unit === this.base.unit
      ) {
        if (this.operator === '+') {
          return new MathSum(
            new objects.Dimension(
              new objects.Number(
                this.base.asNumber() + this.term.base.asNumber(),
              ),
              this.base.unit,
            ),
            this.term.operator,
            this.term.term,
          );
        } else {
          return new MathSum(
            new objects.Dimension(
              new objects.Number(
                this.base.asNumber() - this.term.base.asNumber(),
              ),
              this.base.unit,
            ),
            this.term.operator === '+' ? '-' : '+',
            this.term.term,
          );
        }
      } else if (
        this.term.term instanceof objects.Dimension &&
        this.term.term.unit === this.base.unit
      ) {
        if (this.operator === '+') {
          return new MathSum(
            new objects.Dimension(
              new objects.Number(
                this.term.operator === '+'
                  ? this.base.asNumber() + this.term.term.asNumber()
                  : this.base.asNumber() - this.term.term.asNumber(),
              ),
              this.base.unit,
            ),
            this.operator,
            this.term.base,
          );
        } else {
          return new MathSum(
            new objects.Dimension(
              new objects.Number(
                this.term.operator === '+'
                  ? this.base.asNumber() - this.term.term.asNumber()
                  : this.base.asNumber() + this.term.term.asNumber(),
              ),
              this.base.unit,
            ),
            this.operator,
            this.term.base,
          );
        }
      }
    }

    // OPT: Handle zero gracefully
    if (
      this.base instanceof objects.Dimension &&
      (this.term instanceof objects.Dimension ||
        this.term instanceof objects.Number) &&
      this.term.asNumber() === 0
    ) {
      return this.base;
    } else if (
      this.term instanceof objects.Dimension &&
      (this.base instanceof objects.Dimension ||
        this.base instanceof objects.Number) &&
      this.base.asNumber() === 0
    ) {
      if (this.operator === '+') {
        return this.term;
      }

      return new objects.Dimension(
        new objects.Number(this.term.asNumber() * -1),
        this.term.unit,
      );
    }

    // OPT: drop invalid calculations
    if (
      this.base instanceof objects.Dimension &&
      this.term instanceof objects.Dimension &&
      this.base.unit in unitTypes &&
      this.term.unit in unitTypes &&
      unitTypes[this.base.unit] !== unitTypes[this.term.unit]
    ) {
      return null;
    }
    if (
      (this.base instanceof objects.Dimension &&
        this.term instanceof objects.Number) ||
      (this.base instanceof objects.Number &&
        this.term instanceof objects.Dimension)
    ) {
      return null;
    }

    if (
      this.base instanceof objects.Dimension &&
      this.term instanceof objects.Dimension &&
      this.base.unit === this.term.unit
    ) {
      let val;
      if (this.operator === '+') {
        val = this.base.asNumber() + this.term.asNumber();
      } else if (this.operator === '-') {
        val = this.base.asNumber() - this.term.asNumber();
      } else {
        return this;
      }
      return new objects.Dimension(new objects.Number(val), this.base.unit);
    } else if (
      this.base instanceof objects.Number &&
      this.term instanceof objects.Number
    ) {
      if (this.operator === '+') {
        return new objects.Number(this.base.value + this.term.value);
      } else if (this.operator === '-') {
        return new objects.Number(this.base.value - this.term.value);
      }
    }

    return this;
  }
}
