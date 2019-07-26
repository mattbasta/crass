import {Node, OptimizeKeywords, Selector} from '../nodes/Node';
import * as objects from '../objects';

type Temp = {
  ruleset: objects.Ruleset | null;
  index: number;
  canRemoveFrom: boolean;
};

export default async function combineAdjacentRulesets(
  content: Array<Node>,
  kw: OptimizeKeywords,
) {
  let didChange = false;
  const newContent = [];
  let lastPushed: objects.Ruleset | null = null;

  // A map of selectors to rulesets in this block.
  const selectorMap: {[selector: string]: Array<Temp>} = {};

  const pushSel = (sel: Selector, temp: Temp): void => {
    const strSel = sel.toString();

    if (!(strSel in selectorMap)) {
      selectorMap[strSel] = [temp];
      return;
    }
    for (let i = 0; i < selectorMap[strSel].length; i++) {
      const ruleset = selectorMap[strSel][i];
      const firstRuleset = ruleset.ruleset;
      if (!firstRuleset) continue;
      // We can't remove declarations from a ruleset that's shared by multiple selectors.
      if (!ruleset.canRemoveFrom) return;
      const intersection = lastPushed
        ? lastPushed.declarationIntersections(firstRuleset)
        : [];
      // If there's no overlap, there's nothing to do.
      if (!intersection.length) return;
      // Remove each of the intersected declarations from the initial ruleset.
      for (let j = 0; j < intersection.length; j++) {
        firstRuleset.removeDeclaration(intersection[i]);
      }

      if (!firstRuleset.content.length) {
        newContent[ruleset.index] = ruleset.ruleset = null;
      }
      // Mark that a change did occur.
      didChange = true;
    }
    selectorMap[strSel].push(temp);
  };

  for (const item of content) {
    const areAdjacentRulesets =
      lastPushed &&
      item instanceof objects.Ruleset &&
      lastPushed instanceof objects.Ruleset;
    const areAdjacentMediaBlocks =
      lastPushed &&
      item instanceof objects.Media &&
      lastPushed instanceof objects.Media;

    if (
      lastPushed &&
      item instanceof objects.Ruleset &&
      areAdjacentRulesets &&
      lastPushed.contentToString() === item.contentToString()
    ) {
      // Step 1: Merge the selectors
      if (lastPushed.selector instanceof objects.SelectorList) {
        if (item.selector instanceof objects.SelectorList) {
          lastPushed.selector.selectors = lastPushed.selector.selectors.concat(
            item.selector.selectors,
          );
        } else {
          lastPushed.selector.selectors.push(item.selector);
        }
      } else if (item.selector instanceof objects.SelectorList) {
        item.selector.selectors.push(lastPushed.selector);
        lastPushed.selector = item.selector;
      } else {
        lastPushed.selector = new objects.SelectorList([
          lastPushed.selector,
          item.selector,
        ]);
      }

      // Step 2: Optimize the new selector
      lastPushed.selector = (await lastPushed.selector.optimize(kw)) as
        | Selector
        | objects.SelectorList;

      didChange = true;
      continue;
    } else if (
      lastPushed &&
      item instanceof objects.Ruleset &&
      areAdjacentRulesets &&
      lastPushed.selector.toString() === item.selector.toString()
    ) {
      // Step 1: Combine the content of the adjacent rulesets.
      lastPushed.content = lastPushed.content.concat(item.content);

      // Step 2: Re-optimize the ruleset body.
      lastPushed.optimizeContent(kw);

      didChange = true;
      continue;
    } else if (
      lastPushed &&
      item instanceof objects.Media &&
      // OPT: Combine adjacent media blocks
      areAdjacentMediaBlocks &&
      lastPushed.mediaQueriesToString() === item.mediaQueriesToString()
    ) {
      lastPushed.content.push(...item.content);
      await lastPushed.optimizeContent(kw);

      didChange = true;
      continue;
    }

    newContent.push((lastPushed = item));
    // OPT: Remove declarations that are overridden later in the stylesheet.
    if (lastPushed instanceof objects.Ruleset) {
      const lastPushedSelector = lastPushed.selector;
      const temp = {
        ruleset: lastPushed,
        index: newContent.length - 1,
        canRemoveFrom: !(lastPushedSelector instanceof objects.SelectorList),
      };

      if (lastPushedSelector instanceof objects.SelectorList) {
        for (let j = 0; j < lastPushedSelector.selectors.length; j++) {
          pushSel(lastPushedSelector.selectors[j], temp);
        }
      } else {
        pushSel(lastPushedSelector, temp);
      }
    }
  }

  return didChange ? newContent.filter(x => x) : content;
}
