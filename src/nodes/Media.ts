import * as objects from '../objects';
import * as optimization from '../optimization';
import * as utils from '../utils';
import {Node, OptimizeKeywords} from './Node';

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
    this.media = (await optimization.optimizeList(this.media, kw)) as Array<
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
    this.content = await optimization.optimizeBlocks(this.content, kw);
    if (!this.content.length) {
      return null;
    }

    return this;
  }
}
