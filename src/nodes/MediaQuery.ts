import {Node, OptimizeKeywords} from './Node';
import * as objects from '../objects';
import optimizeList from '../optimizations/optimizeList';
import * as utils from '../utils';

export default class MediaQuery implements Node {
  type: objects.Identifier | null;
  prefix: string | null;
  expression: Array<objects.MediaExpression>;

  constructor(
    type: objects.Identifier | null,
    prefix: string | null,
    expression: Array<objects.MediaExpression>,
  ) {
    this.type = type;
    this.prefix = prefix;
    this.expression = expression || [];
  }

  toString() {
    const output = [];
    if (this.type) {
      if (this.prefix) {
        output.push(this.prefix);
      }
      output.push(this.type);
    }
    if (this.type && this.expression.length) {
      output.push('and');
    }
    if (this.expression.length) {
      output.push(utils.joinAll(this.expression, ' and '));
    }
    return output.join(' ');
  }

  async pretty(indent: number) {
    const output = [];
    if (this.type) {
      if (this.prefix) {
        output.push(this.prefix);
      }
      output.push(this.type);
    }
    if (this.type && this.expression.length) {
      output.push('and');
    }
    if (this.expression.length) {
      output.push(
        await utils.joinAllAsync(
          this.expression,
          ' and ',
          utils.prettyMap(indent),
        ),
      );
    }
    return output.join(' ');
  }

  async optimize(kw: OptimizeKeywords) {
    // TODO(opt): sort expressions
    // TODO(opt): filter bunk expressions
    // OPT: Remove duplicate media expressions
    this.expression = utils.uniq(utils.stringIdentity, this.expression);
    this.expression = await optimizeList(this.expression, kw);

    // OPT: Remove unsupported media queries.
    if (kw.browser_min && kw.browser_min.ie >= 10) {
      this.expression = this.expression.filter(expr => !expr.ieCrap.slashZero);
      if (!this.expression.length) {
        return null;
      }
    }

    return this;
  }
}
