import * as colors from '../colors';
import expandQuadList from '../optimizations/expandQuadList';
import {Node, Expression as NodeExpression, OptimizeKeywords} from './Node';
import * as objects from '../objects';
import try_ from '../optimizations/try';

const noneables = {
  border: 1,
  'border-top': 1,
  'border-right': 1,
  'border-bottom': 1,
  'border-left': 1,
  outline: 1,
  background: 1,
};
const quadLists = [
  'border-color',
  '-webkit-border-radius',
  '-moz-border-radius',
  'border-radius',
  'border-style',
  'border-width',
  'margin',
  'padding',
];

function processQuadList(list: Array<ChainLink>): Array<ChainLink> {
  const keys = list.map(v => v[1].toString());
  if (
    keys.length === 4 &&
    keys[0] == keys[1] &&
    keys[1] === keys[2] &&
    keys[2] === keys[3]
  ) {
    return [list[0]];
  }
  if (keys.length === 4 && keys[0] === keys[2] && keys[1] === keys[3]) {
    return processQuadList([list[0], list[1]]);
  } else if (keys.length === 4 && keys[1] === keys[3]) {
    return processQuadList(list.slice(0, 3));
  }
  if (keys.length === 3 && keys[0] === keys[2]) {
    return processQuadList(list.slice(0, 2));
  }
  if (keys.length === 2 && keys[0] === keys[1]) {
    return list.slice(0, 1);
  }

  return list;
}

export type ChainLinkValue = NodeExpression;
export type ChainLink = [string | null, ChainLinkValue];

export default class Expression implements Node {
  chain: Array<ChainLink>;

  constructor(chain: Array<ChainLink>) {
    this.chain = chain;
  }

  toString() {
    return this.chain.reduce((acc, cur, i) => {
      if (i) {
        acc += cur[0] || ' ';
      }
      acc += cur[1].toString();
      return acc;
    }, '');
  }

  async pretty(indent: number) {
    let result = '';
    for (const cur of this.chain) {
      if (result) {
        if (cur[0] === ',') {
          result += ', ';
        } else if (!cur[0]) {
          result += ' ';
        } else {
          result += cur[0];
        }
      }
      result += await cur[1].pretty(indent);
    }
    return result;
  }

  async optimize(kw: OptimizeKeywords) {
    this.chain = (await Promise.all(
      this.chain.map(async v => {
        if (typeof v[1] === 'string') {
          return v;
        }
        return [v[0], await try_(v[1], kw)] as ChainLink;
      }),
    )).filter(v => !!v[1]);
    if (!this.chain.length) {
      return null;
    }

    if (!kw.declarationName) return this;

    // OPT: Try to minify lists of lengths.
    // e.g.: `margin:0 0 0 0` -> `margin:0`
    if (
      quadLists.includes(kw.declarationName) &&
      this.chain.length > 1 &&
      this.chain.length < 5 &&
      this.chain.every(c => c[0] !== '/')
    ) {
      this.chain = processQuadList(this.chain);
    } else if (
      kw.declarationName === 'border-radius' &&
      this.chain.some(x => x[0] === '/')
    ) {
      const slashIdx = this.findSlash();
      const leftChain = expandQuadList(this.chain.slice(0, slashIdx));
      const rightChain = expandQuadList(
        this.chain.slice(slashIdx).map(x => [null, x[1]]),
      );

      if (
        leftChain.every(
          (x, i) => x[1].toString() === rightChain[i][1].toString(),
        )
      ) {
        this.chain = processQuadList(leftChain);
      } else {
        const pLeftChain = processQuadList(leftChain);
        const pRightChain = processQuadList(rightChain);

        pRightChain[0][0] = '/';
        this.chain = pLeftChain.concat(pRightChain);
      }
    } else if (
      kw.declarationName === 'font-weight' ||
      kw.declarationName === 'font'
    ) {
      this.chain = this.chain.map(
        (chunk): ChainLink => {
          // OPT: font/font-weight: normal -> 400
          if (chunk[1].toString() === 'normal') {
            return [chunk[0], new objects.Number(400)];
          }
          // OPT: font/font-weight: bold -> 700
          else if (chunk[1].toString() === 'bold') {
            return [chunk[0], new objects.Number(700)];
          } else {
            return chunk;
          }
        },
      );
    } else if (
      kw.o1 &&
      kw.declarationName === 'content' &&
      this.chain[0][1].toString() === 'none'
    ) {
      // OPT: `content:none` -> `content:""`
      this.chain[0][1] = new objects.String('');
    } else if (kw.declarationName === 'display' && this.chain.length > 1) {
      const sec = this.chain[1][1].toString();
      switch (this.chain[0][1].toString()) {
        case 'block':
          if (sec === 'flow') {
            this.chain.splice(1, 1);
          } else if (sec === 'flow-root') {
            this.chain = [[null, new objects.String('flow-root')]];
          } else if (sec === 'flex') {
            this.chain = [[null, new objects.String('flex')]];
          } else if (sec === 'grid') {
            this.chain = [[null, new objects.String('grid')]];
          } else if (sec === 'table') {
            this.chain = [[null, new objects.String('table')]];
          }
          break;
        case 'inline':
          if (sec === 'flow') {
            this.chain.splice(1, 1);
          } else if (sec === 'flow-root') {
            this.chain = [[null, new objects.String('inline-block')]];
          } else if (sec === 'flex') {
            this.chain = [[null, new objects.String('inline-flex')]];
          } else if (sec === 'grid') {
            this.chain = [[null, new objects.String('inline-grid')]];
          } else if (sec === 'ruby') {
            this.chain = [[null, new objects.String('ruby')]];
          } else if (sec === 'table') {
            this.chain = [[null, new objects.String('inline-table')]];
          }
          break;
        case 'run-in':
          if (sec === 'flow') {
            this.chain.splice(1, 1);
          }
          break;
        case 'list-item':
          if (
            this.chain.length === 3 &&
            this.chain[2][1].toString() === 'flow'
          ) {
            if (sec === 'block') {
              this.chain = [[null, new objects.String('list-item')]];
            } else if (sec === 'inline') {
              this.chain = [[null, new objects.String('inline-list-item')]];
            }
          }
          break;
        case 'table-cell':
        case 'table-caption':
        case 'ruby-base':
        case 'ruby-text':
          if (sec === 'flow') {
            this.chain.splice(1, 1);
          }
      }
    }

    if (
      kw.declarationName in noneables &&
      this.chain.length === 1 &&
      this.chain[0][1].toString() === 'none'
    ) {
      // OPT: none -> 0 where possible.
      this.chain[0][1] = new objects.Number(0);
    }

    // OPT: Convert color names to hex when possible.
    this.chain.forEach(term => {
      if (typeof term[1] === 'string' && term[1] in colors.COLOR_TO_HEX) {
        term[1] = new objects.HexColor(colors.COLOR_TO_HEX[term[1]]);
      }
    });

    if (!this.chain.length) {
      return null;
    }

    return this;
  }

  findSlash() {
    return this.chain.findIndex(x => x[0] === '/');
  }
}
