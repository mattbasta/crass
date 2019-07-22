import * as optimization from '../optimization';
import {Selector, StringableExpression, OptimizeKeywords} from './Node';

export default class AttributeSelector implements Selector {
  ident: Selector;
  comparison: StringableExpression | null;
  value: StringableExpression | string | null;

  constructor(
    ident: Selector,
    comparison: StringableExpression,
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
    this.ident = (await optimization.try_(
      this.ident,
      kw,
    )) as StringableExpression;
    if (typeof this.value !== 'string') {
      this.value = (await optimization.try_(
        this.value,
        kw,
      )) as StringableExpression;
    }

    if (!this.ident) {
      return null;
    }

    return this;
  }
}
