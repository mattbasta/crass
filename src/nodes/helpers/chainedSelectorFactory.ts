import * as optimization from '../../optimization';
import {Selector, OptimizeKeywords} from '../Node';

export default function chainedSelectorFactory(name: string, operator: string) {
  return class implements Selector {
    operator: string;
    ancestor: Selector;
    descendant: Selector;

    constructor(ancestor: Selector, descendant: Selector) {
      this.ancestor = ancestor;
      this.descendant = descendant;
      this.operator = operator;
    }

    toString() {
      return `${this.ancestor}${this.operator}${this.descendant}`;
    }

    async pretty(indent: number) {
      const paddedType = this.operator === ' ' ? ' ' : ` ${this.operator} `;
      return (
        (await this.ancestor.pretty(indent)) +
        paddedType +
        (await this.descendant.pretty(indent))
      );
    }

    async optimize(kw: OptimizeKeywords) {
      const ancestor = await optimization.try_(this.ancestor, kw);
      if (!ancestor) {
        return null;
      }
      this.ancestor = ancestor;

      const descendant = await optimization.try_(this.descendant, kw);
      if (!descendant) {
        return null;
      }
      this.descendant = descendant;

      return this;
    }
  };
}
