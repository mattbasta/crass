import * as objects from '../objects';
import optimizeList from '../optimizations/optimizeList';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';
import optimizeBlocks from '../optimizations/optimizeBlocks';

export default class Media {
  media: Array<objects.MediaQuery>;
  content: Array<Node>;

  constructor(media: Array<objects.MediaQuery>, content: Array<Node>) {
    this.media = media;
    this.content = content;
  }

  mediaQueriesToString() {
    return utils.joinAll(this.media, ',');
  }

  toString() {
    const queryString = this.mediaQueriesToString();
    return `@media${
      queryString[0] === '(' ? '' : ' '
    }${queryString}{${utils.joinAll(this.content)}}`;
  }

  async pretty(indent: number) {
    let output = '';
    output +=
      utils.indent(
        '@media ' +
          (await utils.joinAllAsync(
            this.media,
            ', ',
            utils.prettyMap(indent),
          )) +
          ' {',
      ) + '\n';
    output +=
      (await Promise.all(
        this.content.map(async line =>
          utils.indent(await line.pretty(indent + 1), indent),
        ),
      )).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
  }

  async optimize(kw: OptimizeKeywords) {
    this.media = (await optimizeList(this.media, kw)) as Array<
      objects.MediaQuery
    >;

    // OPT: Remove duplicate media queries.
    this.media = utils.uniq(utils.stringIdentity, this.media);

    if (!this.media.length) {
      return null;
    }

    return this.optimizeContent(kw);
  }

  async optimizeContent(kw: OptimizeKeywords) {
    this.content = await optimizeBlocks(this.content, kw);
    if (!this.content.length) {
      return null;
    }

    return this;
  }
}
