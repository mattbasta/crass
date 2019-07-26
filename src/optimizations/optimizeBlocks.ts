import combineAdjacentRulesets from './combineAdjacentRulesets';
import * as mergeRulesets from './mergeRulesets';
import {Node, OptimizeKeywords} from '../nodes/Node';
import * as objects from '../objects';
import optimizeList from './optimizeList';

export default async (
  content: Array<Node>,
  kw: OptimizeKeywords,
) => {
  content = await optimizeList(content, kw);
  if (!content.length) {
    return [];
  }

  // OPT: Remove duplicate blocks.
  if (kw.o1) {
    const values: {[key: string]: number} = {};
    const removalMap: Array<boolean> = [];
    for (let i = 0; i < content.length; i++) {
      const lval = content[i].toString();
      if (lval in values) {
        removalMap[values[lval]] = true;
      }
      values[lval] = i;
    }
    if (removalMap.length) {
      // Don't create a new array if nothing changed.
      content = content.filter((elem, i) => !removalMap[i]);
    }
  }

  // OPT: Combine nearby rulesets
  if (kw.o1 && content.length > 1) {
    for (let i = 0; i < content.length - 1; i++) {
      const iRuleset = content[i];
      if (!(iRuleset instanceof objects.Ruleset)) continue;
      for (let j = i + 1; j < content.length; j++) {
        const jRuleset = content[j];
        if (!(jRuleset instanceof objects.Ruleset)) continue;

        const canCombine = mergeRulesets.canRulesetsBeCombined(content, i, j);
        if (!canCombine) continue;

        if (iRuleset.selector instanceof objects.SelectorList) {
          if (jRuleset.selector instanceof objects.SelectorList) {
            iRuleset.selector.selectors = iRuleset.selector.selectors.concat(
              jRuleset.selector.selectors,
            );
          } else {
            iRuleset.selector.selectors.push(jRuleset.selector);
          }
        } else {
          if (jRuleset.selector instanceof objects.SelectorList) {
            iRuleset.selector = new objects.SelectorList(
              [iRuleset.selector].concat(jRuleset.selector.selectors),
            );
          } else {
            iRuleset.selector = new objects.SelectorList([
              iRuleset.selector,
              jRuleset.selector,
            ]);
          }
        }

        const optimized = await iRuleset.optimize(kw);
        if (!optimized) continue;
        content[i] = optimized;

        content.splice(j, 1);
        j--;
      }
    }
  }

  // OPT: Combine adjacent similar rulesets or selectors.
  return combineAdjacentRulesets(content, kw);
};
