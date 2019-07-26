import * as objects from '../objects';
import { ChainLink } from '../nodes/Expression';
import expandQuadList from './expandQuadList';

export type LonghandDeclaration = {
  name: string;
  decls: Array<string>;
  declQualifies: (decl: objects.Declaration) => boolean;
  expressionBuilder: (decls: Array<objects.Declaration>) => Array<ChainLink>;

  allDeclsQualify?: (decls: Array<objects.Declaration>) => boolean;
  canMerge?:
    | false
    | ((shChain: Array<ChainLink>, lhChain: Array<ChainLink>) => boolean);
  shorthandMerger: (
    shChain: Array<ChainLink>,
    lhChain: Array<ChainLink>,
    idx: number,
  ) => Array<ChainLink>;
};


const defaultShorthandExpressionQualifier = (decl: objects.Declaration) =>
  decl.expr.chain.length === 1;
const defaultShorthandExpressionBuilder = (rules: Array<objects.Declaration>) =>
  rules.map(rule => rule.expr.chain[0]);
const defaultShorthandMerger = (
  shChain: Array<ChainLink>,
  lhChain: Array<ChainLink>,
  idx: number,
) => expandQuadList(shChain).map((x, i) => (i === idx ? lhChain[0] : x));

export const shorthandMapping: Array<LonghandDeclaration> = [
  {
    name: 'border-color',
    decls: [
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
    ],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    shorthandMerger: defaultShorthandMerger,
  },
  {
    name: 'border-style',
    decls: [
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style',
    ],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    shorthandMerger: defaultShorthandMerger,
  },
  {
    name: 'border-width',
    decls: [
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width',
    ],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    shorthandMerger: defaultShorthandMerger,
  },
  {
    name: 'margin',
    decls: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    shorthandMerger: defaultShorthandMerger,
  },
  {
    name: 'padding',
    decls: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    shorthandMerger: defaultShorthandMerger,
  },
  {
    name: 'border',
    decls: ['border-width', 'border-style', 'border-color'],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    canMerge: (shChain, lhChain) => {
      // TODO: maybe there's a way to do more?
      return shChain.length === 3 && lhChain.length === 1;
    },
    shorthandMerger: (shChain, lhChain, idx) =>
      shChain.map((x, i) => (i === idx ? lhChain[0] : x)),
  },
  {
    name: 'border',
    decls: ['border-top', 'border-right', 'border-bottom', 'border-left'],
    declQualifies: () => true,
    allDeclsQualify: decls => {
      const first = decls[0];
      const rest = decls.slice(1);
      return rest.every(
        x =>
          x.expr.chain.length === first.expr.chain.length &&
          first.expr.chain.every(
            (item, i) => x.expr.chain[i][1].toString() === item[1].toString(),
          ),
      );
    },
    canMerge: (shChain, lhChain) =>
      shChain.every((x, i) => x[1].toString() === lhChain[i][1].toString()),
    expressionBuilder: rules => rules[0].expr.chain,
    shorthandMerger: shChain => shChain,
  },
  {
    name: 'text-decoration',
    decls: [
      'text-decoration-line',
      'text-decoration-style',
      'text-decoration-color',
    ],
    declQualifies: decl => decl.expr.chain.length >= 1,
    expressionBuilder: rules =>
      rules.reduce((a, b) => a.concat(b.expr.chain), [] as Array<ChainLink>),
    canMerge: false, // TODO: maybe there's a way?
    shorthandMerger: shChain => shChain,
  },
  {
    name: 'text-emphasis',
    decls: ['text-emphasis-style', 'text-emphasis-color'],
    declQualifies: defaultShorthandExpressionQualifier,
    expressionBuilder: defaultShorthandExpressionBuilder,
    canMerge: false, // TODO: maybe there's a way?
    shorthandMerger: shChain => shChain,
  },

  {
    name: 'border-radius',
    decls: [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ],
    declQualifies: decl =>
      decl.expr.chain.length === 1 || decl.expr.chain.length === 2,
    expressionBuilder: rules => {
      const prefix = rules.map(rule => rule.expr.chain[0]);
      if (rules.every(rule => rule.expr.chain.length === 1)) {
        return prefix;
      }
      const suffix = rules.map(
        rule => rule.expr.chain[1] || rule.expr.chain[0],
      );
      suffix[0][0] = '/';
      return prefix.concat(suffix);
    },
    shorthandMerger: (shChain, lhChain, i) => {
      const hasSlash = shChain.some(x => x[0] === '/');
      // Check for the easy path
      if (!hasSlash && lhChain.length === 1) {
        shChain = expandQuadList(shChain);
        shChain[i] = [null, lhChain[0][1]];
        return shChain;
      }

      let slashIdx = 0;
      for (let i = 1; i < shChain.length; i++) {
        if (shChain[i][0] === '/') {
          slashIdx = i;
          break;
        }
      }

      const preSlash: Array<ChainLink> = expandQuadList(
        shChain.slice(0, slashIdx),
      ).map(x => [null, x[1]]);
      const postSlash: Array<ChainLink> = expandQuadList(
        shChain.slice(slashIdx),
      ).map(x => [null, x[1]]);

      preSlash[i][1] = lhChain[0][1];
      postSlash[i][1] = lhChain[1] ? lhChain[1][1] : lhChain[0][1];

      postSlash[0][0] = '/';

      return preSlash.concat(postSlash);
    },
  },

  // TODO: transition
  // TODO: animation
];

export const shorthandMappingMapped = shorthandMapping.reduce(
  (acc, cur) => {
    if (cur.name in acc) {
      acc[cur.name].push(cur);
    } else {
      acc[cur.name] = [cur];
    }
    return acc;
  },
  {} as {[name: string]: Array<LonghandDeclaration>},
);
