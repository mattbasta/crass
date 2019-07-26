import {
  OptimizeKeywords,
  DepthSelector,
  TerminalSelector,
  TreeSelector,
} from '../Node';
import try_ from '../../optimizations/try';

export default function chainedSelectorFactory(name: string, operator: string) {
  return class implements DepthSelector {
    operator: string;
    ancestor: TerminalSelector;
    descendant: TreeSelector;

    constructor(ancestor: TerminalSelector, descendant: TreeSelector) {
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
      const ancestor = await try_(this.ancestor, kw);
      if (!ancestor) {
        return null;
      }
      this.ancestor = ancestor;

      const descendant = await try_(this.descendant, kw);
      if (!descendant) {
        return null;
      }
      this.descendant = descendant;

      return this;
    }
  };
}
