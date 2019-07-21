import * as objects from '../objects';
import * as optimization from '../optimization';
import {Selector, OptimizeKeywords} from './Node';

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
    this.selector = (await optimization.try_(
      this.selector,
      kw,
    )) as objects.SelectorList;
    return this;
  }
}
