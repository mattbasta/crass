import * as objects from '../objects';
import * as optimization from '../optimization';
import {OptimizeKeywords} from './Node';

type IECrap = {slashZero: boolean};
export default class MediaExpression {
  descriptor: string;
  value: objects.Expression | null;
  ieCrap: IECrap;

  constructor(
    descriptor: string,
    value: objects.Expression | null,
    ieCrap: IECrap,
  ) {
    this.descriptor = descriptor;
    this.value = value;
    this.ieCrap = ieCrap;
  }

  toString() {
    const descriptor = this.descriptor.toString();
    const slashZero = this.ieCrap.slashZero ? '\\0' : '';
    if (this.value) {
      return '(' + descriptor + ':' + this.value.toString() + slashZero + ')';
    } else {
      return '(' + descriptor + slashZero + ')';
    }
  }

  async pretty(indent: number) {
    const descriptor = this.descriptor.toString();
    const slashZero = this.ieCrap.slashZero ? '\\0' : '';
    if (this.value) {
      return (
        '(' +
        descriptor +
        ': ' +
        (await this.value.pretty(indent)) +
        slashZero +
        ')'
      );
    } else {
      return '(' + descriptor + slashZero + ')';
    }
  }

  async optimize(kw: OptimizeKeywords) {
    if (this.value) {
      this.value = (await optimization.try_(
        this.value,
        kw,
      )) as objects.Expression | null;
    }
    return this;
  }
}