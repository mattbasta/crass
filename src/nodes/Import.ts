import {Node} from './Node';
import * as objects from '../objects';

export default class Import implements Node {
  href: objects.URI | objects.String;
  media: Array<objects.MediaQuery>;

  constructor(
    href: objects.URI | objects.String,
    media: Array<objects.MediaQuery> | null,
  ) {
    this.href = href;
    this.media = media || [];
  }

  toString() {
    return `@import ${this.href.asString()}${
      this.media ? ` ${this.media.join(',')}` : ''
    };`;
  }

  async pretty() {
    return this.toString() + '\n';
  }

  async optimize() {
    return this;
  }
}
