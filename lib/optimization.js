var colorConvert = require('color-convert');

var colors = require('./colors');
var objects = require('./objects');
var utils = require('./utils');

var mergeRulesets = require('./optimizations/mergeRulesets');


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

module.exports.overrideList = {
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
    '-webkit-transition-timing-function': ['-webkit-transition']
};


var optimizeList = module.exports.optimizeList = function(list, kw) {
    var output = [];
    var temp;
    for (var i = 0; i < list.length; i++) {
        temp = list[i].optimize(kw);
        if (!temp) continue;
        output.push(temp);
    }
    return output;
};

function _combineAdjacentRulesets(content, kw) {
    var didChange = false;
    var newContent = [];
    var lastPushed;

    // A map of selectors to rulesets in this block.
    var selectorMap = {};

    var pushSel = function(sel, temp) {
        var strSel = sel.toString();

        if (!(strSel in selectorMap))
            selectorMap[strSel] = [];
        else {
            var firstRuleset, ruleset;
            var j;
            for (var i = 0; i < selectorMap[strSel].length; i++) {
                ruleset = selectorMap[strSel][i];
                firstRuleset = ruleset.ruleset;
                if (!firstRuleset) continue;
                // We can't remove declarations from a ruleset that's shared by multiple selectors.
                if (!ruleset.canRemoveFrom) return;
                var intersection = lastPushed.declarationIntersections(firstRuleset);
                // If there's no overlap, there's nothing to do.
                if (!intersection.length) return;
                // Remove each of the intersected declarations from the initial ruleset.
                for (j = 0; j < intersection.length; j++) {
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

    var areAdjacentRulesets;
    var temp;
    var j;

    for (var i = 0; i < content.length; i++) {
        areAdjacentRulesets = (lastPushed &&
                               content[i] instanceof objects.Ruleset &&
                               lastPushed instanceof objects.Ruleset);

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
            var hasSelectorList = lastPushed.selector instanceof objects.SelectorList;
            temp = {
                ruleset: lastPushed,
                index: newContent.length - 1,
                canRemoveFrom: !hasSelectorList
            };

            if (hasSelectorList) {
                for (j = 0; j < lastPushed.selector.selectors.length; j++) {
                    pushSel(lastPushed.selector.selectors[j], temp);
                }
            } else {
                pushSel(lastPushed.selector, temp);
            }
        }
    }

    return didChange ? newContent.filter(utils.identity) : content;
}

module.exports.optimizeBlocks = function(content, kw) {

    content = optimizeList(content, kw);

    // OPT: Remove duplicate blocks.
    if (kw.o1) {
        var values = {};
        var removalMap = [];
        for (var i = 0; i < content.length; i++) {
            var lval = content[i].toString();
            if (lval in values) removalMap[values[lval]] = true;
            values[lval] = i;
        }
        if (removalMap.length) {  // Don't create a new array if nothing changed.
            content = content.filter(function(elem, i) {
                return !removalMap[i];
            });
        }
    }

    // OPT: Combine nearby rulesets
    if (kw.o1 && content.length > 1) {
        var canCombine;
        for (var i = 0; i < content.length - 1; i++) {
            for (var j = i + 1; j < content.length; j++) {
                canCombine = mergeRulesets.canRulesetsBeCombined(content, i, j);
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
    content = _combineAdjacentRulesets(content, kw);

    return content;
};

module.exports.optimizeDeclarations = function(content, kw) {
    content = optimizeList(content, kw);
    if (!content.length) return [];

    // OPT: Remove overridden CSS properties
    var seenDeclarations = {};
    var decl;
    for (var i = content.length - 1; i >= 0; i--) {
        decl = content[i];
        if (decl.ident in seenDeclarations) continue;

        // If we match an overridable declaration and we've seen one of the
        // things that overrides it, remove it from the ruleset.
        if (decl.ident in module.exports.overrideList &&
            module.exports.overrideList[decl.ident].some(function(overrider) {
                return overrider in seenDeclarations;
            })) {

            content.splice(i, 1);
            continue;
        }

        seenDeclarations[decl.ident] = true;
    }


    // OPT: Sort declarations.
    content = content.sort(function(a, b) {
        if (a.ident === b.ident) {
            return a.toString().localeCompare(b.toString());
        }
        return a.ident.localeCompare(b.ident);
    });

    // OPT: Remove duplicate declarations.
    if (kw.o1) {
        return utils.uniq(function(decl) {
            return decl.ident;
        }, content);
    } else {
        // We want to remove identical duplicate declarations normally.
        return utils.uniq(null, content);
    }
};

module.exports.try_ = function(obj, kw) {
    if (!obj) return obj;
    if (obj.optimize) return obj.optimize(kw);
    return obj;
};

function func(name, values, sep) {
    sep = typeof sep !== 'undefined' ? sep : ',';
    return new objects.Func(
        name,
        new objects.Expression(
            values.map(function(v, index) {
                if (typeof v === 'number') {
                    v = new objects.Number(v);
                }
                if (typeof sep === 'function') {
                    return [sep(index), v];
                } else {
                    return [index ? sep : null, v];
                }
            })
        )
    );
}

function percentify(x) {
    return new objects.Dimension(new objects.Number(x), '%')
}
function hslArgs(args) {
    args[1] = percentify(args[1]);
    args[2] = percentify(args[2]);
    return args;
}

var shortenHexColor = module.exports.shortenHexColor = function(hex) {
    if (hex[1] === hex[2] &&
        hex[3] === hex[4] &&
        hex[5] === hex[6]) {
        return '#' + hex[1] + hex[3] + hex[5];
    }
    return hex;
};

function makeHex(rgb) {
    return '#' + rgb.map(function(c) {
        var str = c.toString(16);
        if (str.length === 1) {
            str = '0' + str;
        }
        return str;
    }).join('');
}

function minimizeNum(n) {
    return (new objects.Number(n)).toString();
}

module.exports.color = function(applier, alpha, kw) {
    var choices = [];
    var grayVal;

    if (alpha > 1) {
        alpha = 1;
    } else if (alpha < 0) {
        alpha = 0;
    }

    if (alpha === 0) {
        applier = function(fn) {
            if (fn === 'rgb') {
                return [0, 0, 0];
            }
            return colorConvert.rgb[fn]([0, 0, 0]);
        };
    }

    var hsl = applier('hsl');
    var hwb = applier('hwb');
    var lab = applier('lab');
    var lch = applier('lch');
    var rgb = applier('rgb');

    if (alpha === 1) {
        choices.push(
            [
                'rgb(' +  rgb.map(minimizeNum).join(',') + ')',
                function() {
                    return func('rgb', rgb);
                }
            ]
        );
        choices.push(
            [
                // NOTE: This isn't "correct" but it gives the correct length, which is what matters
                'hsl(' +  rgb.map(minimizeNum).join('%,') + ')',
                function() {
                    return func('hsl', [hsl[0], percentify(hsl[1]), percentify(hsl[2])]);
                }
            ]
        );
        if (kw.css4) {
            choices.push(
                [
                    'hwb(' +  hwb.map(minimizeNum).join(' ') + ')',
                    function() {
                        return func('hwb', [hwb[0], percentify(hwb[1]), percentify(hwb[2])], null);
                    }
                ]
            );
            choices.push(
                [
                    'lab(' +  lab.map(minimizeNum).join(' ') + ')',
                    function() {
                        return func('lab', [lab[0], percentify(lab[1]), percentify(lab[2])], null);
                    }
                ]
            );
            choices.push(
                [
                    'lch(' +  lch.map(minimizeNum).join(' ') + ')',
                    function() {
                        return func('lch', [lch[0], percentify(lch[1]), percentify(lch[2])], null);
                    }
                ]
            );
        }

        var hex = shortenHexColor(makeHex(rgb)).toLowerCase();
        choices.push(
            [
                hex,
                function() {
                    return new objects.HexColor(hex);
                }
            ]
        );

        // OPT: Return the color name instead of hex value when shorter.
        if (hex in colors.HEX_TO_COLOR) {
            choices.push(
                [
                    colors.HEX_TO_COLOR[hex],
                    function() {
                        return colors.HEX_TO_COLOR[hex];
                    }
                ]
            );
        }

        if (
            kw.css4 &&
            rgb[0] === rgb[1] &&
            rgb[1] === rgb[2]
        ) {
            grayVal = (rgb[0] / 255 * 100).toFixed(2);
            choices.push(
                [
                    'gray(' + minimizeNum(grayVal) + '%)',
                    function() {
                        return func('gray', [percentify(grayVal)]);
                    }
                ]
            );
        }
    } else {
        var alphaNum = minimizeNum(alpha);

        choices.push(
            [
                'rgba(' +  rgb.map(minimizeNum).join(',') + ',' + alphaNum + ')',
                function() {
                    return func('rgba', rgb.concat([alpha]));
                }
            ]
        );
        choices.push(
            [
                // NOTE: This isn't "correct" but it gives the correct length, which is what matters
                'hsla(' +  hsl.map(minimizeNum).join('%,') + ',' + alphaNum + ')',
                function() {
                    return func('hsla', hslArgs(hsl).concat([alpha]));
                }
            ]
        );
        if (kw.css4) {
            choices.push(
                [
                    'hwb(' +  hwb.map(minimizeNum).join(' ') + '/' + alphaNum + ')',
                    function() {
                        return func(
                            'hwb',
                            [hwb[0], percentify(hwb[1]), percentify(hwb[2]), alpha],
                            function(i) {
                                return i === 3 ? '/' : null;
                            }
                        );
                    }
                ]
            );
            choices.push(
                [
                    'lab(' +  lab.map(minimizeNum).join(' ') + '/' + alphaNum + ')',
                    function() {
                        return func(
                            'lab',
                            [lab[0], lab[1], lab[2], alpha],
                            function(i) {
                                return i === 3 ? '/' : null;
                            }
                        );
                    }
                ]
            );
            choices.push(
                [
                    'lch(' +  lch.map(minimizeNum).join(' ') + '/' + alphaNum + ')',
                    function() {
                        return func(
                            'lch',
                            [lch[0], lch[1], lch[2], alpha],
                            function(i) {
                                return i === 3 ? '/' : null;
                            }
                        );
                    }
                ]
            );

            var hexVariant = '#' + colorConvert.rgb.hex(rgb).toLowerCase();
            var hexAlphaV = ('00' + (alpha * 255).toString(16)).substr(-2);
            if (hexAlphaV.indexOf('.') === -1) {
                var canShortenHexVariant = (
                    hexVariant.length !== shortenHexColor(hexVariant).length &&
                    hexAlphaV[0] === hexAlphaV[1]
                );
                if (canShortenHexVariant) {
                    var shortenHexColorVariant = shortenHexColor(hexVariant);
                    choices.push(
                        [
                            shortenHexColorVariant + hexAlphaV,
                            function() {
                                return new objects.HexColor(shortenHexColorVariant + hexAlphaV[0]);
                            }
                        ]
                    );
                } else {
                    choices.push(
                        [
                            hexVariant + hexAlphaV,
                            function() {
                                return new objects.HexColor(hexVariant + hexAlphaV);
                            }
                        ]
                    );
                }
            }
        }

        if (
            kw.css4 &&
            rgb[0] === rgb[1] &&
            rgb[1] === rgb[2]
        ) {
            grayVal = minimizeNum((rgb[0] / 255 * 100).toFixed(2));
            choices.push(
                [
                    'gray(' + grayVal + '%/' + alphaNum + ')',
                    function() {
                        return func('gray', [percentify(grayVal), alpha], '/');
                    }
                ]
            );
        }

        if (alpha === 0) {
            choices.push(
                [
                    'transparent',
                    function() {
                        return 'transparent';
                    }
                ]
            );
        }
    }

    return choices.reduce(function(acc, cur) {
        var len = cur[0].length;
        var accLen = acc[0].length;

        if (len < accLen) {
            return cur;
        } else {
            return acc;
        }
    })[1]();
};

// Units to be optimize when using --O1 only.
var opt_unit_o1_only = {
    cm: true,
    mm: true,
    q: true,
    turn: true,
};
var length_units = {
    'in': 96,
    px: 1,
    pt: 4 / 3,
    pc: 16,
    cm: 37.79,
    mm: 3.779,
    q: 37.79 / 40, // 1/40 of a cm
};
var angular_units = {
    deg: 1,
    rad: 180 / Math.PI,
    grad: 9 / 10,
    turn: 360,
};
var temporal_units = {
    s: 1000,
    ms: 1,
};
var frequency_units = {
    Hz: 1,
    kHz: 1000,
};
var resolution_units = {
    dpi: 1,
    dpcm: 1 / 2.54,
    dppx: 1 / 96,
};

module.exports.unit = function(unit, kw) {
    function optimizeMin(unit, units) {
        var versions = {};
        var base_unit = units[unit.unit] * unit.number.asNumber();
        var shortest;
        var shortestLen = unit.toString().length;

        var temp;
        for (var i in units) {
            if (!kw.o1 && i in opt_unit_o1_only || i === 'turn' || i === unit.unit) continue;
            temp = versions[i] = new objects.Dimension(new (objects.Number)(base_unit / units[i]), i);
            if (temp.toString().length < shortestLen) {
                shortest = i;
                shortestLen = temp.toString().length;
            }
        }
        if (!shortest) return unit;
        return versions[shortest];
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


module.exports.combineList = function(mapper, reducer, list) {
    var values = {};
    for (var i = 0; i < list.length; i++) {
        var lval = mapper(list[i]);
        if (!(lval in values))
            values[lval] = list[i];
        else
            values[lval] = reducer(values[lval], list[i]);
    }
    var output = [];
    for (var key in values) {
        if (values.hasOwnProperty(key)) {
            output.push(values[key]);
        }
    }
    return output;
};
