/*

Merging Rulesets

Aside from simple adjacent combinations, it's sometimes possible to combine
sibling rulesets together (Nth into 1st). The rules for this are complicated,
however, because the ability to combine the rulesets is governed by many
different factors:

- Specificity of inner rulesets
- Use of !important
- The type of selectors for the rulesets being merged
- etc.

This file attempts to abstract those concepts into a single set of defined
rules.

*/

import {
  Node,
  TreeSelector,
  DepthSelector,
  TerminalSelector,
} from '../nodes/Node';
import * as objects from '../objects';

export function anyBetween<T>(
  body: Array<T>,
  i: number,
  j: number,
  filter: (val: T) => boolean,
): boolean {
  for (let x = i + 1; x < j; x++) {
    if (filter(body[x])) {
      return true;
    }
  }
  return false;
}

export function manySome<T>(
  arrX: Array<T>,
  arrY: Array<T>,
  func: (a: T, b: T) => boolean,
): boolean {
  for (let i = 0; i < arrX.length; i++) {
    if (!arrX[i]) continue;
    for (let j = 0; j < arrY.length; j++) {
      if (!arrY[j]) continue;
      if (func(arrX[i], arrY[j])) {
        return true;
      }
    }
  }
  return false;
}

const isRuleset = (item: Node): item is objects.Ruleset =>
  item instanceof objects.Ruleset;
const isMediaQuery = (item: Node): item is objects.Media =>
  item instanceof objects.Media;
const isIDSelector = (item: Node): item is objects.IDSelector =>
  item instanceof objects.IDSelector;
const isAttributeSelector = (item: Node): item is objects.AttributeSelector =>
  item instanceof objects.AttributeSelector;
const isPseudoElementSelector = (
  item: Node,
): item is objects.PseudoElementSelector =>
  item instanceof objects.PseudoElementSelector;
const isPseudoClassSelector = (
  item: Node,
): item is objects.PseudoClassSelector =>
  item instanceof objects.PseudoClassSelector;

function normalizeSelector(
  selector: objects.SelectorList | TreeSelector,
): Array<TreeSelector> {
  return selector instanceof objects.SelectorList
    ? selector.selectors
    : [selector];
}

function getLastInSelectorChain(
  selector: objects.SelectorList | TreeSelector,
): TerminalSelector {
  if (selector instanceof objects.SimpleSelector) return selector;
  return getLastInSelectorChain((selector as DepthSelector).descendant);
}

function xor<T>(a: T | null, b: T | null): boolean;
function xor(a: boolean, b: boolean) {
  return (a || b) && !(a && b);
}

const mutuallyExclusiveAttrSelectors = ['=', '|=', '^=', '$='];

export function canSelectorsEverTouchSameElement(
  fullX: Array<TreeSelector>,
  fullY: Array<TreeSelector>,
) {
  const selX = fullX.map(getLastInSelectorChain);
  const selY = fullY.map(getLastInSelectorChain);

  return manySome(selX, selY, (xSel, ySel) => {
    const x = xSel.conditions;
    const y = ySel.conditions;

    const xFirst = x[0];
    const yFirst = y[0];
    if (
      xFirst instanceof objects.ElementSelector &&
      yFirst instanceof objects.ElementSelector
    ) {
      return xFirst.ident === yFirst.ident && xFirst.ns === yFirst.ns;
    }

    const xId = x.find(isIDSelector);
    const yId = x.find(isIDSelector);
    if (xId && yId) {
      return xId.ident === yId.ident;
    }

    // This check will return whether there is no chance that the selectors
    // would overlap
    const attrTest = manySome(x, y, (x, y) => {
      if (!isAttributeSelector(x) || !isAttributeSelector(y)) {
        // False because they might be anything and overlap
        return false;
      }

      if (!x.value || !y.value) {
        // If we're not comparing values, we have no way to know if the
        // attributes overlap.
        return false;
      }

      // TODO: There's a lot of other combinations that could be mutually
      // exclusive. `[x=abc]` and `[x^=b]` could be determined to never
      // match, for instance.

      // If the
      return Boolean(
        x.ident.toString() === y.ident.toString() &&
          x.comparison &&
          x.comparison === y.comparison &&
          !mutuallyExclusiveAttrSelectors.includes(x.comparison) &&
          x.value.toString() === y.value.toString(),
      );
    });
    if (attrTest) {
      return false;
    }

    if (xor(x.find(isPseudoElementSelector), y.find(isPseudoElementSelector))) {
      return false;
    }
    if (xor(x.find(isPseudoClassSelector), y.find(isPseudoClassSelector))) {
      return false;
    }

    // TODO: not() support for classes, attributes

    return true;
  });
}

const supersetCache = new WeakMap<Array<any>, Array<string>>();
export function isSubset<T extends {toString: () => string}>(
  subset: Array<T>,
  superset: Array<T>,
): boolean {
  if (!subset.length) {
    return false;
  }
  let strSuperset: Array<string>;
  if (supersetCache.has(superset)) {
    strSuperset = supersetCache.get(superset)!;
  } else {
    strSuperset = superset.map(x => x.toString());
    supersetCache.set(superset, strSuperset);
  }
  return subset.every(stmt => strSuperset.includes(stmt.toString()));
}

export function canRulesetsBeCombined(
  parentBody: Array<objects.Ruleset>,
  xIdx: number,
  yIdx: number,
): boolean {
  const x = parentBody[xIdx];
  const y = parentBody[yIdx];
  if (!isRuleset(x) || !isRuleset(y)) {
    return false;
  }
  if (!isSubset(y.content, x.content)) {
    return false;
  }

  // You can't combine rulesets if there are media queries between the two.
  if (anyBetween(parentBody, xIdx, yIdx, isMediaQuery)) {
    return false;
  }

  const ySelector = normalizeSelector(y.selector);

  // Adjacent rulesets are fine to merge.
  if (xIdx === yIdx - 1) return true;

  for (let i = yIdx - 1; i > xIdx; i--) {
    if (!isRuleset(parentBody[i])) {
      continue;
    }

    const tempSelector = normalizeSelector(parentBody[i].selector);
    if (canSelectorsEverTouchSameElement(ySelector, tempSelector)) {
      return false;
    }
  }

  return true;
}
