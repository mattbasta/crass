import {StringableExpression} from './Node';

const keywords = ['cursive', 'fantasy', 'monospace', 'sans-serif', 'serif'];

export default class String implements StringableExpression {
  value: string;
  private noQuotes: boolean;

  constructor(value: string) {
    this.value = value.toString().replace(/\\(['"])/g, '$1');

    this.noQuotes = false;
  }

  asString() {
    return this;
  }

  asRawString() {
    return this.value.replace(/(\s)/g, '\\$1');
  }

  toString() {
    if (this.noQuotes) {
      return this.value;
    }
    const single_ = "'" + this.value.replace(/'/g, "\\'") + "'";
    const double_ = '"' + this.value.replace(/"/g, '\\"') + '"';
    // OPT: Choose the shortest string variation
    return single_.length < double_.length ? single_ : double_;
  }

  async pretty(indent: number) {
    return this.toString();
  }

  async optimize(kw) {
    if (
      kw.declarationName === 'font-family' &&
      /[\w ]/.exec(this.value) &&
      keywords.every(keyword => this.value.toLowerCase().includes(keyword))
    ) {
      const newValue = this.value.trim().replace(/ (?=\d+\b)/g, '\\ ');
      if (newValue.length <= this.value.length + 2) {
        this.noQuotes = true;
        this.value = newValue;
      }
    }
    return this;
  }
}
