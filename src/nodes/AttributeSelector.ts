import * as objects from '../objects';
import {StringableExpression, OptimizeKeywords, SelectorCondition} from './Node';
import try_ from '../optimizations/try';

export default class AttributeSelector implements SelectorCondition {
  ident: objects.Identifier;
  comparison: string | null;
  value: StringableExpression | string | null;

  constructor(
    ident: objects.Identifier,
    comparison: string | null,
    value: StringableExpression,
  ) {
    this.ident = ident;
    this.comparison = comparison;
    this.value = value;
  }

  toString() {
    // TODO: Handle quoting/unquoting
    if (this.value) {
      let value = this.value.toString();
      if (typeof this.value !== 'string') {
        const rawValue = this.value.asRawString(true);
        const newValue = rawValue.match(/^[a-z][\w\\]*$/i)
          ? rawValue
          : this.value.asRawString();
        if (newValue.length <= value.length) {
          value = newValue;
        }
      }
      return '[' + this.ident + this.comparison + value + ']';
    } else {
      return '[' + this.ident + ']';
    }
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase attribute names.
    this.ident.value = this.ident.value.toLowerCase();

    if (typeof this.value !== 'string') {
      this.value = (await try_(this.value, kw)) as StringableExpression;
    }

    return this;
  }
}
