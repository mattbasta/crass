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

var objects = require('../objects');


function anyBetween(body, i, j, filter) {
    for (var x = i + 1; x < j; x++) {
        if (filter(body[x])) {
            return true;
        }
    }
    return false;
}

function manySome(arrX, arrY, func) {
    for (var i = 0; i < arrX.length; i++) {
        if (!arrX[i]) continue;
        for (var j = 0; j < arrY.length; j++) {
            if (!arrY[j]) continue;
            if (func(arrX[i], arrY[j])) {
                return true;
            }
        }
    }
    return false;
}

function arrayFind(array, cb) {
    for (var i = 0; i < array.length; i++) {
        if (cb(array[i])) return array[i];
    }
    return false;
}


function isRuleset(item) {
    return item instanceof objects.Ruleset;
}
function isMediaQuery(item) {
    return item instanceof objects.Media;
}
function isIDSelector(item) {
    return item instanceof objects.IDSelector;
}
function isAttributeSelector(item) {
    return item instanceof objects.AttributeSelector;
}
function isPseudoElementSelector(item) {
    return item instanceof objects.PseudoElementSelector;
}

function isPseudoClassSelector(item) {
    return item instanceof objects.PseudoClassSelector;
}

function normalizeSelector(selector) {
    if (selector instanceof objects.SelectorList) {
        return selector.selectors;
    }
    return [selector];
}

function getLastInSelectorChain(selector) {
    if (selector instanceof objects.SimpleSelector) return selector;
    return getLastInSelectorChain(selector.descendant);
}

var mutuallyExclusiveAttrSelectors = {
    '=': true,
    '|=': true,
    '^=': true,
    '$=': true,
};

function canSelectorsEverTouchSameElement(selX, selY) {
    selX = selX.map(getLastInSelectorChain);
    selY = selY.map(getLastInSelectorChain);

    // TODO: Look at ID usage elsewhere in the selector. You might find
    // something like this:
    //   #foo *
    //   bar#foo
    // This otherwise looks (based on the last element in the selector) like
    // they might match, but the #foo usage tells otherwise.

    return manySome(selX, selY, function(x, y) {
        x = x.conditions;
        y = y.conditions;

        var xFirst = x[0];
        var yFirst = y[0];
        if (xFirst instanceof objects.ElementSelector &&
            yFirst instanceof objects.ElementSelector) {
            return xFirst.ident === yFirst.ident && xFirst.ns === yFirst.ns;
        }

        var temp;
        var xId = arrayFind(x, isIDSelector);
        var yId = arrayFind(x, isIDSelector);
        if (xId && yId) {
            return xId.ident !== yId.ident;
        }

        var attrTest = manySome(x, y, function(x, y) {
            if (!isAttributeSelector(x)) return false;
            if (!isAttributeSelector(y)) return false;

            if (!x.value || !y.value) return false;

            // TODO: There's a lot of other combinations that could be mutually
            // exclusive. `[x=abc]` and `[x^=b]` could be determined to never
            // match, for instance.
            return x.ident.toString() === y.ident.toString() &&
                x.comparison === y.comparison &&
                x.comparison in mutuallyExclusiveAttrSelectors &&
                x.value.toString() !== y.value.toString();
        });
        if (attrTest) return false;

        if (arrayFind(x, isPseudoElementSelector) ^ arrayFind(y, isPseudoElementSelector)) return false;
        if (arrayFind(x, isPseudoClassSelector) ^ arrayFind(y, isPseudoClassSelector)) return false;

        // TODO: not() support for classes, attributes

        return true;
    });
}
exports.canSelectorsEverTouchSameElement = canSelectorsEverTouchSameElement;


function isSubset(subset, superset) {
    function toString(x) {
        return x.toString();
    }
    var strSuperset = superset.map(toString);
    return subset.map(toString).every(function(stmt) {
        return strSuperset.indexOf(stmt) !== -1;
    });
}

function canRulesetsBeCombined(parentBody, xIdx, yIdx) {
    var x = parentBody[xIdx];
    var y = parentBody[yIdx];
    if (!isRuleset(x) || !isRuleset(y)) return false;
    if (!isSubset(y.content, x.content)) {
        return false;
    }


    // You can't combine rulesets if there are media queries between the two.
    if (anyBetween(parentBody, xIdx, yIdx, isMediaQuery)) {
        return false;
    }

    var xSelector = normalizeSelector(x.selector);
    var ySelector = normalizeSelector(y.selector);

    // Adjacent rulesets are fine to merge.
    if (xIdx === yIdx - 1) return true;

    var tempSelector;
    for (var i = yIdx - 1; i > xIdx; i--) {
        if (!isRuleset(parentBody[i])) continue;

        tempSelector = normalizeSelector(parentBody[i].selector);
        if (canSelectorsEverTouchSameElement(ySelector, tempSelector)) return false;
    }

    return true;

}
exports.canRulesetsBeCombined = canRulesetsBeCombined;
