import * as optimization from '../../optimization';
import {Selector} from '../Node';

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

    async optimize(kw) {
      this.ancestor = await optimization.try_(this.ancestor, kw);
      this.descendant = await optimization.try_(this.descendant, kw);

      if (!this.ancestor || !this.descendant) {
        return null;
      }

      return this;
    }
  };
}
