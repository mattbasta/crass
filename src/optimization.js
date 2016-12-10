'use strict';

const colors = require('./colors');
const objects = require('./objects');
const utils = require('./utils');

const mergeRulesets = require('./optimizations/mergeRulesets');


module.exports.quadLists = {
    'border-color': 1,
    '-webkit-border-radius': 1,
    '-moz-border-radius': 1,
    'border-radius': 1,
    'border-style': 1,
    'border-width': 1,
    'margin': 1,
    'padding': 1
};

module.exports.noneables = {
    'border': 1,
    'border-top': 1,
    'border-right': 1,
    'border-bottom': 1,
    'border-left': 1,
    'outline': 1,
    'background': 1,
};

const overrideList = module.exports.overrideList = {
    'animation-delay': ['animation'],
    'animation-direction': ['animation'],
    'animation-duration': ['animation'],
    'animation-fill-mode': ['animation'],
    'animation-iteration-count': ['animation'],
    'animation-name': ['animation'],
    'animation-play-state': ['animation'],
    'animation-timing-function': ['animation'],
    '-moz-animation-delay': ['-moz-animation'],
    '-moz-animation-direction': ['-moz-animation'],
    '-moz-animation-duration': ['-moz-animation'],
    '-moz-animation-fill-mode': ['-moz-animation'],
    '-moz-animation-iteration-count': ['-moz-animation'],
    '-moz-animation-name': ['-moz-animation'],
    '-moz-animation-play-state': ['-moz-animation'],
    '-moz-animation-timing-function': ['-moz-animation'],
    '-o-animation-delay': ['-o-animation'],
    '-o-animation-direction': ['-o-animation'],
    '-o-animation-duration': ['-o-animation'],
    '-o-animation-fill-mode': ['-o-animation'],
    '-o-animation-iteration-count': ['-o-animation'],
    '-o-animation-name': ['-o-animation'],
    '-o-animation-play-state': ['-o-animation'],
    '-o-animation-timing-function': ['-o-animation'],
    '-webkit-animation-delay': ['-webkit-animation'],
    '-webkit-animation-direction': ['-webkit-animation'],
    '-webkit-animation-duration': ['-webkit-animation'],
    '-webkit-animation-fill-mode': ['-webkit-animation'],
    '-webkit-animation-iteration-count': ['-webkit-animation'],
    '-webkit-animation-name': ['-webkit-animation'],
    '-webkit-animation-play-state': ['-webkit-animation'],
    '-webkit-animation-timing-function': ['-webkit-animation'],
    'background-clip': ['background'],
    'background-origin': ['background'],
    'border-color': ['border'],
    'border-style': ['border'],
    'border-width': ['border'],
    'border-bottom': ['border'],
    'border-bottom-color': ['border-bottom', 'border-color', 'border'],
    'border-bottom-style': ['border-bottom', 'border-style', 'border'],
    'border-bottom-width': ['border-bottom', 'border-width', 'border'],
    'border-left': ['border'],
    'border-left-color': ['border-left', 'border-color', 'border'],
    'border-left-style': ['border-left', 'border-style', 'border'],
    'border-left-width': ['border-left', 'border-width', 'border'],
    'border-right': ['border'],
    'border-right-color': ['border-right', 'border-color', 'border'],
    'border-right-style': ['border-right', 'border-style', 'border'],
    'border-right-width': ['border-right', 'border-width', 'border'],
    'border-top': ['border'],
    'border-top-color': ['border-top', 'border-color', 'border'],
    'border-top-style': ['border-top', 'border-style', 'border'],
    'border-top-width': ['border-top', 'border-width', 'border'],
    'font-family': ['font'],
    'font-size': ['font'],
    'font-style': ['font'],
    'font-variant': ['font'],
    'font-weight': ['font'],
    'margin-bottom': ['margin'],
    'margin-left': ['margin'],
    'margin-right': ['margin'],
    'margin-top': ['margin'],
    'padding-bottom': ['padding'],
    'padding-left': ['padding'],
    'padding-right': ['padding'],
    'padding-top': ['padding'],
    'text-decoration-color': ['text-decoration'],
    'text-decoration-line': ['text-decoration'],
    'text-decoration-style': ['text-decoration'],
    'transition-delay': ['transition'],
    'transition-duration': ['transition'],
    'transition-property': ['transition'],
    'transition-timing-function': ['transition'],
    '-moz-transition-delay': ['-moz-transition'],
    '-moz-transition-duration': ['-moz-transition'],
    '-moz-transition-property': ['-moz-transition'],
    '-moz-transition-timing-function': ['-moz-transition'],
    '-o-transition-delay': ['-o-transition'],
    '-o-transition-duration': ['-o-transition'],
    '-o-transition-property': ['-o-transition'],
    '-o-transition-timing-function': ['-o-transition'],
    '-webkit-transition-delay': ['-webkit-transition'],
    '-webkit-transition-duration': ['-webkit-transition'],
    '-webkit-transition-property': ['-webkit-transition'],
    '-webkit-transition-timing-function': ['-webkit-transition'],
};

const defaultShorthandExpressionQualifier = decl => decl.expr.chain.length === 1;
const defaultShorthandExpressionBuilder = rules => rules.map(rule => rule.expr.chain[0]);
const shorthandMapping = [
    {
        name: 'border-color',
        decls: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
        declQualifies: defaultShorthandExpressionQualifier,
        expressionBuilder: defaultShorthandExpressionBuilder,
    },
    {
        name: 'border-style',
        decls: ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
        declQualifies: defaultShorthandExpressionQualifier,
        expressionBuilder: defaultShorthandExpressionBuilder,
    },
    {
        name: 'border-width',
        decls: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
        declQualifies: defaultShorthandExpressionQualifier,
        expressionBuilder: defaultShorthandExpressionBuilder,
    },
    {
        name: 'margin',
        decls: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
        declQualifies: defaultShorthandExpressionQualifier,
        expressionBuilder: defaultShorthandExpressionBuilder,
    },
    {
        name: 'padding',
        decls: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
        declQualifies: defaultShorthandExpressionQualifier,
        expressionBuilder: defaultShorthandExpressionBuilder,
    },
    {
        name: 'border',
        decls: ['border-width', 'border-style', 'border-color'],
        declQualifies: defaultShorthandExpressionQualifier,
        expressionBuilder: defaultShorthandExpressionBuilder,
    },

    {
        name: 'border-radius',
        decls: ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
        declQualifies: decl =>
            decl.expr.chain.length === 1 || decl.expr.chain.length === 2,
        expressionBuilder: rules => {
            const prefix = rules.map(rule => rule.expr.chain[0]);
            if (rules.every(rule => rule.expr.chain.length === 1)) {
                return prefix;
            }
            const suffix = rules.map(rule => rule.expr.chain[1] || rule.expr.chain[0]);
            suffix[0][0] = '/';
            return prefix.concat(suffix);
        },
    }
];


const optimizeList = module.exports.optimizeList = (list, kw) => {
    const output = [];
    for (let i = 0; i < list.length; i++) {
        const temp = list[i].optimize(kw);
        if (!temp) continue;
        output.push(temp);
    }
    return output;
};

function _combineAdjacentRulesets(content, kw) {
    let didChange = false;
    const newContent = [];
    let lastPushed;

    // A map of selectors to rulesets in this block.
    const selectorMap = {};

    const pushSel = (sel, temp) => {
        const strSel = sel.toString();

        if (!(strSel in selectorMap))
            selectorMap[strSel] = [];
        else {
            for (let i = 0; i < selectorMap[strSel].length; i++) {
                const ruleset = selectorMap[strSel][i];
                const firstRuleset = ruleset.ruleset;
                if (!firstRuleset) continue;
                // We can't remove declarations from a ruleset that's shared by multiple selectors.
                if (!ruleset.canRemoveFrom) return;
                const intersection = lastPushed.declarationIntersections(firstRuleset);
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
        }
        selectorMap[strSel].push(temp);
    };

    for (let i = 0; i < content.length; i++) {
        const areAdjacentRulesets = (
            lastPushed &&
            content[i] instanceof objects.Ruleset &&
            lastPushed instanceof objects.Ruleset
        );

        if (areAdjacentRulesets &&
            lastPushed.contentToString() === content[i].contentToString()) {

            // Step 1: Merge the selectors
            if (lastPushed.selector instanceof objects.SelectorList) {
                if (content[i].selector instanceof objects.SelectorList) {
                    lastPushed.selector.selectors = lastPushed.selector.selectors.concat(content[i].selector.selectors);
                } else {
                    lastPushed.selector.selectors.push(content[i].selector);
                }
            } else if (content[i].selector instanceof objects.SelectorList) {
                content[i].selector.selectors.push(lastPushed.selector);
                lastPushed.selector = content[i].selector;
            } else {
                lastPushed.selector = new objects.SelectorList([
                    lastPushed.selector,
                    content[i].selector
                ]);
            }

            // Step 2: Optimize the new selector
            lastPushed.selector = lastPushed.selector.optimize(kw);

            didChange = true;
            continue;

        } else if (areAdjacentRulesets &&
                   lastPushed.selector.toString() === content[i].selector.toString()) {

            // Step 1: Combine the content of the adjacent rulesets.
            lastPushed.content = content[i].content.concat(lastPushed.content);

            // Step 2: Re-optimize the ruleset body.
            lastPushed.optimizeContent(kw);

            didChange = true;
            continue;

        }

        newContent.push(lastPushed = content[i]);
        // OPT: Remove declarations that are overridden later in the stylesheet.
        if (lastPushed instanceof objects.Ruleset) {
            const hasSelectorList = lastPushed.selector instanceof objects.SelectorList;
            const temp = {
                ruleset: lastPushed,
                index: newContent.length - 1,
                canRemoveFrom: !hasSelectorList
            };

            if (hasSelectorList) {
                for (let j = 0; j < lastPushed.selector.selectors.length; j++) {
                    pushSel(lastPushed.selector.selectors[j], temp);
                }
            } else {
                pushSel(lastPushed.selector, temp);
            }
        }
    }

    return didChange ? newContent.filter(utils.identity) : content;
}

module.exports.optimizeBlocks = (content, kw) => {

    content = optimizeList(content, kw);

    // OPT: Remove duplicate blocks.
    if (kw.o1) {
        const values = {};
        const removalMap = [];
        for (let i = 0; i < content.length; i++) {
            const lval = content[i].toString();
            if (lval in values) removalMap[values[lval]] = true;
            values[lval] = i;
        }
        if (removalMap.length) {  // Don't create a new array if nothing changed.
            content = content.filter((elem, i) => !removalMap[i]);
        }
    }

    // OPT: Combine nearby rulesets
    if (kw.o1 && content.length > 1) {
        for (let i = 0; i < content.length - 1; i++) {
            for (let j = i + 1; j < content.length; j++) {
                const canCombine = mergeRulesets.canRulesetsBeCombined(content, i, j);
                if (!canCombine) continue;

                if (content[i].selector instanceof objects.SelectorList) {
                    if (content[j].selector instanceof objects.SelectorList) {
                        content[i].selector.selectors = content[i].selector.selectors.concat(content[j].selector.selectors);
                    } else {
                        content[i].selector.selectors.push(content[j].selector);
                    }
                } else {
                    if (content[j].selector instanceof objects.SelectorList) {
                        content[i].selector = new objects.SelectorList(
                            [content[i].selector].concat(content[j].selector.selectors)
                        );
                    } else {
                        content[i].selector = new objects.SelectorList([
                            content[i].selector,
                            content[j].selector,
                        ]);
                    }
                }

                content[i] = content[i].optimize(kw);

                content.splice(j, 1);
                j--;

            }
        }
    }

    // OPT: Combine adjacent similar rulesets or selectors.
    return _combineAdjacentRulesets(content, kw);
};

module.exports.optimizeDeclarations = (content, kw) => {
    content = optimizeList(content, kw);
    if (!content.length) return [];

    // OPT: Remove longhand declarations that are overridden by shorthand declarations
    const seenDeclarations = {};
    for (let i = content.length - 1; i >= 0; i--) {
        const decl = content[i];
        if (decl.ident in seenDeclarations) {
            content.splice(i, 1);
            continue;
        }

        // If we match an overridable declaration and we've seen one of the
        // things that overrides it, remove it from the ruleset.
        if (
            decl.ident in overrideList &&
            overrideList[decl.ident].some(overrider => overrider in seenDeclarations)
        ) {
            content.splice(i, 1);
            continue;
        }

        seenDeclarations[decl.ident] = decl;
    }
    // OPT: Merge together 'piecemeal' declarations when all pieces are specified
    // Ex. padding-left, padding-right, padding-top, padding-bottom -> padding
    shorthandMapping.forEach(shMap => {
        const subRules = [];
        for (let rule of shMap.decls) {
            const seen = seenDeclarations[rule];
            if (!seen || !shMap.declQualifies(seen)) {
                return;
            }

            subRules.push(seen);
        }

        // Remove the declarations that will be merged
        for (let decl of subRules) {
            content.splice(content.indexOf(decl), 1);
            delete seenDeclarations[decl.ident];
        }

        const mergedRule = new objects.Declaration(
            shMap.name,
            new objects.Expression(
                shMap.expressionBuilder(subRules)
            )
        );
        const optimized = mergedRule.optimize(kw);
        content.push(optimized);
        seenDeclarations[shMap.name] = optimized;
    });

    // TODO: Under O1, do these sorts of reductions:
    /*
        border-color: red;
        border-style: solid;
        border-width: 0 0 4px;
    into
        border: 0 solid red;
        border-bottom-width: 4px;
    or
        border: 0 solid red;
        border-width: 0 0 4px;
    */

    // OPT: Sort declarations.
    return content.sort((a, b) => {
        if (a.ident === b.ident) {
            return a.toString().localeCompare(b.toString());
        }
        return a.ident.localeCompare(b.ident);
    });
};

module.exports.try_ = (obj, kw) => {
    if (!obj) return obj;
    if (obj.optimize) return obj.optimize(kw);
    return obj;
};


// Units to be optimize when using --O1 only.
const opt_unit_o1_only = {
    cm: true,
    mm: true,
    q: true,
    turn: true,
};
const length_units = {
    'in': 96,
    px: 1,
    pt: 4 / 3,
    pc: 16,
    cm: 37.79,
    mm: 3.779,
    q: 37.79 / 40, // 1/40 of a cm
};
const angular_units = {
    deg: 1,
    rad: 180 / Math.PI,
    grad: 9 / 10,
    turn: 360,
};
const temporal_units = {
    s: 1000,
    ms: 1,
};
const frequency_units = {
    Hz: 1,
    kHz: 1000,
};
const resolution_units = {
    dpi: 1,
    dpcm: 1 / 2.54,
    dppx: 1 / 96,
};

module.exports.unit = (unit, kw) => {
    function optimizeMin(unit, units) {
        const versions = {};
        const base_unit = units[unit.unit] * unit.number.asNumber();
        let shortest;
        let shortestLen = unit.toString().length;

        for (let i in units) {
            if (!kw.o1 && i in opt_unit_o1_only || i === 'turn' || i === unit.unit) continue;
            const temp = versions[i] = new objects.Dimension(new (objects.Number)(base_unit / units[i]), i);
            if (temp.toString().length < shortestLen) {
                shortest = i;
                shortestLen = temp.toString().length;
            }
        }
        return !shortest ? unit : versions[shortest];
    }

    switch (unit.unit) {
        // Length units
        case 'cm':
        case 'mm':
        case 'q':
            if (!kw.o1) return unit;
        case 'in':
        case 'px':
        case 'pt':
        case 'pc':
            return optimizeMin(unit, length_units);
        // Angular units
        case 'deg':
        case 'rad':
        case 'grad':
        case 'turn':
            return optimizeMin(unit, angular_units);
        // Temporal units
        case 's':
        case 'ms':
            return optimizeMin(unit, temporal_units);
        // Frequency units
        case 'Hz':
        case 'kHz':
            return optimizeMin(unit, frequency_units);
        // Resolution units
        case 'dpi':
        case 'dpcm':
        case 'dppx':
            return optimizeMin(unit, resolution_units);
        default:
            return unit;
    }
};


module.exports.combineList = (mapper, reducer, list) => {
    const values = {};
    for (let i = 0; i < list.length; i++) {
        const lval = mapper(list[i]);
        if (!(lval in values))
            values[lval] = list[i];
        else
            values[lval] = reducer(values[lval], list[i]);
    }
    const output = [];
    for (let key in values) {
        if (values.hasOwnProperty(key)) {
            output.push(values[key]);
        }
    }
    return output;
};
