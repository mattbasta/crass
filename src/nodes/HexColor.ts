import * as colorConvert from 'color-convert';

import colorOptimizer, {shortenHexColor} from '../optimizations/color';
import * as colors from '../colors';
import {Expression, OptimizeKeywords} from './Node';

export default class HexColor implements Expression {
  color: string;

  constructor(color: string) {
    this.color = color;
  }

  toString() {
    return this.color;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw: OptimizeKeywords) {
    // OPT: Lowercase hex colors.
    this.color = this.color.toLowerCase();

    this.stripColorAlpha();

    if (this.color.length === 5 || this.color.length === 9) {
      const unalphaed = this.color.substr(1, this.color.length === 5 ? 3 : 6);
      const applier = (funcName: keyof (typeof colorConvert.hex)) =>
        (colorConvert.hex[funcName] as (
          color: string,
        ) => [number, number, number])(unalphaed);
      const alpha =
        this.color.length === 5
          ? parseInt(this.color.substr(-1), 16) / 15
          : parseInt(this.color.substr(-2), 16) / 255;
      return (colorOptimizer as any)(applier, alpha, kw);
    }

    // OPT: Shorten hex colors
    this.color = shortenHexColor(this.color);
    // OPT: Convert hex -> name when possible.
    if (this.color in colors.HEX_TO_COLOR) {
      return colors.HEX_TO_COLOR[this.color];
    }

    return this;
  }

  stripColorAlpha() {
    if (this.color.length === 5 && this.color[4] === 'f') {
      this.color = this.color.substr(0, 4);
      return;
    }
    if (
      this.color.length === 9 &&
      this.color[7] === 'f' &&
      this.color[8] === 'f'
    ) {
      this.color = this.color.substr(0, 7);
      return;
    }
  }
}
