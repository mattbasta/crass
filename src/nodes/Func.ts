import * as colorConvert from 'color-convert';

import * as colorOptimizer from '../optimizations/color';
import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {
  Expression as NodeExpression,
  OptimizeKeywords,
  NumberableExpression,
} from './Node';

const recognizedColorFuncs: {
  [func: string]: {minArgs: number; maxArgs: number};
} = {
  rgb: {minArgs: 3, maxArgs: 3},
  hsl: {minArgs: 3, maxArgs: 3},
  rgba: {minArgs: 4, maxArgs: 4},
  hsla: {minArgs: 4, maxArgs: 4},
  gray: {minArgs: 1, maxArgs: 2},
  hwb: {minArgs: 3, maxArgs: 4},
  lab: {minArgs: 3, maxArgs: 4},
  lch: {minArgs: 3, maxArgs: 4},
};
const ALPHA_INDEX: {[func: string]: number} = {
  gray: 1,
  rgba: 3,
  hsla: 3,
  hwb: 3,
  lab: 3,
  lch: 3,
};

const GRADIENT_ANGLES: {[position: string]: () => NumberableExpression} = {
  top: () => new objects.Number(0),
  right: () => new objects.Dimension(new objects.Number(90), 'deg'),
  bottom: () => new objects.Dimension(new objects.Number(180), 'deg'),
  left: () => new objects.Dimension(new objects.Number(270), 'deg'),
};

function asRealNum(num: NumberableExpression | string): number {
  if (typeof num === 'string') {
    return new objects.Number(num).asNumber();
  }
  if (num instanceof objects.Dimension) {
    if (num.unit === '%') return asRealNum(num.number);
    if (num.unit === 'deg') return ((num.number.asNumber() % 360) / 360) * 255;
    if (num.unit === 'grad') return ((num.number.asNumber() % 400) / 400) * 255;
    if (num.unit === 'rad')
      return ((num.number.asNumber() % (2 * Math.PI)) / (2 * Math.PI)) * 255;
    if (num.unit === 'turn') return (num.number.asNumber() % 1) * 255;
  }
  return num.asNumber();
}

export default class Func implements NodeExpression {
  name: string;
  content: objects.Expression;

  constructor(name: string, content: objects.Expression) {
    this.name = name;
    this.content = content;
  }

  toString() {
    return `${this.name}(${this.content ? this.content.toString() : ''})`;
  }

  async pretty(indent: number) {
    return `${this.name}(${this.content ? this.content.pretty(indent) : ''})`;
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase function names.
    this.name = this.name.toLowerCase();

    const oldkwf = kw.func;
    kw.func = this.name;
    if (this.content) {
      this.content = (await optimization.try_(
        this.content,
        kw,
      )) as objects.Expression;
    } else if (this.name.indexOf('linear-gradient') !== -1) {
      return null;
    }

    if (
      this.isCalc() &&
      !(
        this.content instanceof objects.MathSum ||
        this.content instanceof objects.MathProduct
      )
    ) {
      return this.content;
    }

    let self = await this.optimizeColor(kw);
    if (!self || !(self instanceof Func)) {
      kw.func = oldkwf;
      return self;
    }

    self = await self.optimizeLinearGradient(kw);
    if (!self || !self.content) {
      kw.func = oldkwf;
      return null;
    }

    self = await self.optimizeRadialGradient(kw);
    if (!self || !self.content) {
      kw.func = oldkwf;
      return null;
    }

    self = await self.optimizeCalc(kw);

    kw.func = oldkwf;
    return self;
  }

  isCalc() {
    return Boolean(/^(\-[a-z]+\-)?calc$/i.exec(this.name));
  }

  async optimizeColor(kw: OptimizeKeywords) {
    if (!(this.name in recognizedColorFuncs)) {
      return this;
    }

    const spec = recognizedColorFuncs[this.name];
    if (
      this.content.chain.length < spec.minArgs ||
      this.content.chain.length > spec.maxArgs
    ) {
      return null;
    }

    if (
      !this.content ||
      !this.content.chain ||
      !this.content.chain.every((x, i) => {
        if (ALPHA_INDEX[this.name] && i === ALPHA_INDEX[this.name]) {
          return utils.isNum(x[1]);
        }
        if (
          ((i === 0 &&
            (this.name === 'hsl' ||
              this.name === 'hsla' ||
              this.name === 'hwb')) ||
            (i === 2 && this.name === 'lch')) &&
          x[1] instanceof objects.Dimension
        ) {
          return true;
        }
        if (
          (i === 1 && this.name === 'hwb') ||
          (i === 2 && this.name === 'hwb')
        ) {
          return x[1] instanceof objects.Dimension;
        }
        return utils.isNum(x[1]);
      })
    ) {
      return null;
    }

    // OPT: Convert color functions to shortest variants
    const chainLength = this.content.chain.length;
    switch (this.name) {
      case 'rgb':
      case 'hsl':
        if (chainLength !== 3) return this;
        break;
      case 'rgba':
      case 'hsla':
        if (chainLength !== 4) return this;
        break;
      case 'gray':
        if (chainLength < 1 || chainLength > 2) return this;
        break;
      case 'hwb':
      case 'lab':
      case 'lch':
        if (chainLength < 3 || chainLength > 4) return this;
        break;
      default:
        return this;
    }

    let applier;
    let alpha = 1;

    const components = this.content.chain
      .map(v => asRealNum(v[1]))
      .map(v => Math.max(v, 0));

    switch (this.name) {
      case 'rgba':
      case 'hsla':
        alpha = components[3];
        applier = (funcName: string) => {
          const name = this.name.substr(0, 3);
          if (funcName === name) {
            return components.slice(0, 3);
          }
          return colorConvert[name][funcName](
            components[0],
            components[1],
            components[2],
          );
        };
        break;
      case 'rgb':
      case 'hsl':
        applier = (funcName: string) => {
          if (funcName === this.name) {
            return components.slice(0, 3);
          }
          return colorConvert[this.name][funcName](
            components[0],
            components[1],
            components[2],
          );
        };
        break;
      case 'gray':
        if (components.length > 1) {
          alpha = components[1];
        }
        applier = (funcName: string) =>
          colorConvert.gray[funcName](components[0]);
        break;
      case 'hwb':
      case 'lab':
      case 'lch':
        if (components.length > 3) {
          alpha = components[3];
        }
        applier = (funcName: string) => {
          if (funcName === this.name) {
            return components.slice(0, 3);
          }
          return colorConvert[this.name][funcName](
            components[0],
            components[1],
            components[2],
          );
        };
        break;
      default:
        return this;
    }

    return colorOptimizer(applier, alpha, kw);
  }

  async optimizeLinearGradient(kw: OptimizeKeywords) {
    if (
      !(
        this.name === 'linear-gradient' ||
        this.name === 'repeating-linear-gradient' ||
        this.name === '-webkit-linear-gradient' ||
        this.name === '-webkit-repeating-linear-gradient'
      ) ||
      !this.content ||
      !this.content.chain
    ) {
      return this;
    }

    let chain = this.content.chain;

    if (
      chain.length > 2 &&
      chain[2][0] !== null &&
      chain[0][1] === 'to' &&
      chain[1][1] in GRADIENT_ANGLES
    ) {
      const val = chain[1][1];
      chain = chain.slice(1);
      chain[0] = [null, GRADIENT_ANGLES[val]()];
    }

    const segments = chain.reduce(
      (acc, cur) => {
        if (cur[0] !== null) {
          acc.push([]);
        }
        acc[acc.length - 1].push(cur);
        return acc;
      },
      [[]],
    );
    let lastStop = null;
    segments.forEach((group, idx) => {
      if (
        group.length !== 2 ||
        !(
          group[1][1] instanceof objects.Dimension ||
          group[1][1] instanceof objects.Number
        )
      ) {
        return;
      }
      const isFinal = idx === segments.length - 1;
      if (!lastStop) {
        lastStop = group[1][1];
        if (isFinal) {
          return;
        }
        if (
          lastStop instanceof objects.Dimension &&
          (lastStop.asNumber() !== 0 || lastStop.unit !== '%')
        ) {
          return;
        }
        if (lastStop instanceof objects.Number && lastStop.asNumber() !== 0) {
          return;
        }
        group[1][1] = null;
        return;
      }

      // TODO: This should consider the units and transform to px if possible
      if (
        lastStop.unit === group[1][1].unit &&
        lastStop.asNumber() >= group[1][1].asNumber()
      ) {
        group[1][1] = new objects.Number(0);
      }
      lastStop = group[1][1];
      if (
        isFinal &&
        group[1][1].unit === '%' &&
        group[1][1].asNumber() === 100
      ) {
        group[1][1] = null;
      }
    });

    chain = chain.filter(x => x[1]);
    const content = await new objects.Expression(chain).optimize(kw);
    if (!content) {
      return null;
    }
    this.content = content;
    return this;
  }

  async optimizeRadialGradient(kw: OptimizeKeywords) {
    if (
      (this.name !== 'radial-gradient' &&
        this.name !== 'repeating-radial-gradient' &&
        this.name !== '-webkit-radial-gradient' &&
        this.name !== '-webkit-repeating-radial-gradient') ||
      !this.content ||
      !this.content.chain ||
      !this.content.chain.length
    ) {
      return this;
    }

    const chain = this.content.chain;
    const segments = chain.reduce(
      (acc, cur) => {
        if (cur[0] !== null) {
          acc.push([]);
        }
        acc[acc.length - 1].push(cur);
        return acc;
      },
      [[]],
    );
    let lastStop = null;
    segments.forEach((group, idx) => {
      if (
        group.length !== 2 ||
        !(
          group[1][1] instanceof objects.Dimension ||
          group[1][1] instanceof objects.Number
        )
      ) {
        return;
      }
      var isFinal = idx === segments.length - 1;
      if (!lastStop) {
        lastStop = group[1][1];
        if (isFinal) {
          return;
        }
        if (
          lastStop instanceof objects.Dimension &&
          (lastStop.asNumber() !== 0 || lastStop.unit !== '%')
        ) {
          return;
        }
        if (lastStop instanceof objects.Number && lastStop.asNumber() !== 0) {
          return;
        }
        group[1][1] = null;
        return;
      }

      // TODO: This should consider the units and transform to px if possible
      if (
        lastStop.unit === group[1][1].unit &&
        lastStop.asNumber() >= group[1][1].asNumber()
      ) {
        group[1][1] = new objects.Number(0);
      }
      lastStop = group[1][1];
      if (
        isFinal &&
        group[1][1].unit === '%' &&
        group[1][1].asNumber() === 100
      ) {
        group[1][1] = null;
      }
    });

    this.content = (await new objects.Expression(chain).optimize(kw))!;
    return this;
  }

  async optimizeCalc(kw: OptimizeKeywords) {
    if (!this.isCalc()) {
      return this;
    }
    const content = await this.content.optimize(kw);
    if (!content) {
      return null;
    }
    this.content = content;
    return this;
  }
}
