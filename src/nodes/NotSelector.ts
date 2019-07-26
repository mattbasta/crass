import * as objects from '../objects';
import {Selector, OptimizeKeywords} from './Node';
import try_ from '../optimizations/try';

export default class NotSelector implements Selector {
  selector: objects.SelectorList;

  constructor(selector: objects.SelectorList) {
    this.selector = selector;
  }

  toString() {
    return ':not(' + this.selector.toString() + ')';
  }

  async pretty(indent: number) {
    return ':not(' + (await this.selector.pretty(indent)) + ')';
  }

  async optimize(kw: OptimizeKeywords) {
    this.selector = (await try_(this.selector, kw)) as objects.SelectorList;
    return this;
  }
}
