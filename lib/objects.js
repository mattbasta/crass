module.exports.extend = function extend(base, extension) {
    for (var i in extension) {
        if (!extension.hasOwnProperty(i)) continue;
        base[i] = extension[i];
    }
};

var browser_support = require('./browser_support');
var colors = require('./colors');
var utils = require('./utils');
var optimization = require('./optimization');


exports.Charset = require('./nodes/Charset');
exports.CounterStyle = require('./nodes/CounterStyle');
exports.FontFace = require('./nodes/FontFace');
exports.FontFeatureValues = require('./nodes/FontFeatureValues');
exports.FontFeatureValuesBlock = require('./nodes/FontFeatureValuesBlock');
exports.Import = require('./nodes/Import');
exports.Keyframe = require('./nodes/Keyframe');
exports.Keyframes = require('./nodes/Keyframes');
exports.KeyframeSelector = require('./nodes/KeyframeSelector');
exports.Media = require('./nodes/Media');
exports.MediaExpression = require('./nodes/MediaExpression');
exports.MediaQuery = require('./nodes/MediaQuery');
exports.Namespace = require('./nodes/Namespace');
exports.Page = require('./nodes/Page');
exports.PageMargin = require('./nodes/PageMargin');
exports.Stylesheet = require('./nodes/Stylesheet');
exports.Supports = require('./nodes/Supports');
exports.SupportsConditionList = require('./nodes/SupportsConditionList');
exports.SupportsCondition = require('./nodes/SupportsCondition');
exports.Viewport = require('./nodes/Viewport');


exports.createSupportsConditionList = function(addition, combinator, base) {
    if (base instanceof exports.SupportsConditionList && base.combinator === combinator) {
        base.unshift(addition);
        return base;
    } else {
        return new exports.SupportsConditionList(combinator, [addition, base]);
    }
};


exports.Ruleset = function(selector, content) {
    this.selector = selector;
    this.content = content;

    this.contentToString = function() {
        return utils.joinAll(this.content, ';');
    };
    this.declarationIntersections = function(ruleset) {
        var myDeclarations = this.content.map(function(decl) {
            return decl.ident;
        });
        var intersection = [];
        for (var i = 0; i < this.content.length; i++) {
            if (myDeclarations.indexOf(this.content[i].ident) !== -1) {
                intersection.push(this.content[i].ident);
            }
        }
        return intersection;
    };
    this.removeDeclaration = function(declaration) {
        this.content = this.content.filter(function(decl) {
            return decl.ident !== declaration;
        });
    };

    this.toString = function toString() {
        return this.selector.toString() + '{' + this.contentToString() + '}';
    };
    this.pretty = function pretty(indent) {
        var output = '';
        output += utils.indent(this.selector.pretty(indent) + ' {', indent) + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimizeContent = function(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
    };
    this.optimize = function optimize(kw) {
        // OPT: Ignore `* html` hacks from IE6
        if (!kw.saveie &&
            // Ignore selector lists, which handle this case separately
            !(this.selector instanceof exports.SelectorList) &&
            /\* html($| .+)/.exec(this.selector.toString())) {
            return null;
        }

        this.selector = optimization.try_(this.selector, kw);

        this.optimizeContent(kw);

        // OPT: Remove empty rulsets.
        if (!this.content.length) {
            return null;
        }
        return this;
    };
};

exports.SelectorList = require('./nodes/SelectorList');
exports.createSelectorList = function(base, addon) {
    if (base instanceof exports.SelectorList) {
        base.push(addon);
        return base;
    } else {
        return new exports.SelectorList([base, addon]);
    }
};

exports.SimpleSelector = function(conditions) {
    this.conditions = conditions;

    this.toString = function toString() {
        return utils.joinAll(this.conditions);
    };
    this.pretty = function pretty(indent) {
        return utils.joinAll(this.conditions, null, utils.prettyMap(indent));
    };
    this.optimize = function optimize(kw) {
        this.conditions = optimization.optimizeList(this.conditions, kw);
        // OPT: Remove duplicate conditions from a simple selector.
        this.conditions = utils.uniq(null, this.conditions);

        // OPT(O1): Remove unnecessary wildcard selectors
        if (kw.o1 && this.conditions.length > 1) {
            this.conditions = this.conditions.filter(function(item) {
                return item.toString() !== '*';
            });
        }
        return this;
    };
};

function selectorChain(type, options) {
    options = options || {};
    return function(ancestor, descendant) {
        // ancestor should always be the "l-value"
        // descendant should always be the "r-value"
        this.ancestor = ancestor;
        this.descendant = descendant;

        this.toString = function toString() {
            return this.ancestor.toString() + type + this.descendant.toString();
        };
        this.pretty = options.pretty || function(indent) {
            var padded_type = type === ' ' ? ' ' : (' ' + type + ' ');
            return this.ancestor.pretty(indent) + padded_type + this.descendant.pretty(indent);
        };
        this.optimize = options.optimize || function(kw) {
            this.ancestor = optimization.try_(this.ancestor, kw);
            this.descendant = optimization.try_(this.descendant, kw);
            return this;
        };
    };
}

exports.AdjacentSelector = selectorChain('+');
exports.DirectDescendantSelector = selectorChain('>');
exports.SiblingSelector = selectorChain('~');
exports.DescendantSelector = selectorChain(' ');


exports.IDSelector = require('./nodes/IDSelector');
exports.ClassSelector = require('./nodes/ClassSelector');
exports.ElementSelector = require('./nodes/ElementSelector');
exports.AttributeSelector = require('./nodes/AttributeSelector');
exports.PseudoElementSelector = require('./nodes/PseudoElementSelector');



exports.NthSelector = function(func_name, linear_func) {
    this.func_name = func_name;
    this.linear_func = linear_func;

    this.toString = function toString() {
        return ':' + this.func_name + '(' + this.linear_func.toString() + ')';
    };
    this.pretty = function pretty(indent) {
        var lf_pretty = this.linear_func.pretty ? this.linear_func.pretty(indent) : this.linear_func.toString();
        return ':' + this.func_name + '(' + lf_pretty + ')';
    };
    this.optimize = function optimize(kw) {
        this.linear_func = optimization.try_(this.linear_func, kw);

        // OPT: nth-selectors (2n+1) to (odd)
        if (this.linear_func.toString() === '2n+1') {
            return new exports.NthSelector(this.func_name, 'odd');
        }

        return this;
    };
};

exports.NotSelector = function(selector) {
    this.selector = selector;

    this.toString = function toString() {
        return ':not(' + this.selector.toString() + ')';
    };
    this.pretty = function pretty(indent) {
        return ':not(' + this.selector.pretty(indent) + ')';
    };
    this.optimize = function optimize(kw) {
        this.selector = optimization.try_(this.selector, kw);
        return this;
    };
};

exports.PseudoSelectorFunction = function(func_name, expr) {
    this.func_name = func_name;
    this.expr = expr;

    this.toString = function toString() {
        return ':' + this.func_name + '(' + this.expr.toString() + ')';
    };
    this.pretty = function pretty(indent) {
        return ':' + this.func_name + '(' + this.expr.pretty(indent) + ')';
    };
    this.optimize = function optimize(kw) {
        // OPT: Lowercase pseudo function names.
        this.func_name = this.func_name.toLowerCase();
        this.expr = optimization.try_(this.expr, kw);
        return this;
    };
};

exports.PseudoClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function toString() {return ':' + this.ident;};
    this.pretty = function pretty(indent) {return this.toString();};
    this.optimize = function optimize(kw) {
        // OPT: Lowercase pseudo class names.
        this.ident = this.ident.toLowerCase();
        return this;
    };
};

exports.LinearFunction = function(n_val, offset) {
    this.n_val = n_val;
    this.offset = offset;

    this.toString = function toString(pad) {
        if (this.n_val) {
            var operator = pad ? ' + ' : '+';
            if (this.offset.value < 0) {
                operator = pad ? ' - ' : '-';
            }
            return this.n_val.toString() + operator + this.offset.asUnsigned().toString();
        } else {
            return this.offset.toString();
        }
    };
    this.pretty = function pretty(indent) {return this.toString(true);};
    this.optimize = function optimize(kw) {
        this.n_val = optimization.try_(this.n_val, kw);
        return this;
    };
};

exports.NValue = function(coef) {
    this.coef = coef;

    this.toString = function toString() {
        var coef = this.coef;
        if (coef.asNumber) coef = coef.asNumber();
        if (coef === 1) {
            return 'n';
        } else if (!coef) {
            return '0';
        } else {
            return coef.toString() + 'n';
        }
    };
    this.pretty = function pretty(indent) {return this.toString();};
    this.optimize = function optimize(kw) {return this;};
};

exports.IEFilter = function(blob) {
    this.ident = 'filter';  // Hack so that we can duck-type this as a Declaration.
    this.blob = blob;

    this.toString = function toString() {return this.blob;};
    this.pretty = function pretty(indent) {return this.toString();};
    this.optimize = function optimize(kw) {
        if (kw.browser_min && kw.browser_min.ie && kw.browser_min.ie > 9) {
            return null;
        }

        return this;
    };
};

exports.Declaration = function(ident, expr) {
    this.ident = ident;
    this.expr = expr;
    this.important = false;
    this.slash_nine = false;

    this.toString = function toString() {
        return this.ident + ':' + this.expr.toString() +
            (this.important ? '!important' : '') +
            (this.slash_nine ? '\\9' : '');
    };
    this.pretty = function pretty(indent) {
        return this.ident + ': ' + this.expr.pretty(indent) +
            (this.important ? ' !important' : '') +
            (this.slash_nine ? ' \\9' : '');
    };
    this.optimize = function optimize(kw) {

        // OPT: Lowercase descriptor names.
        this.ident = this.ident.toLowerCase();

        // OPT: Ignore * declarations from old IE
        if (!kw.saveie && this.ident[0] === '*') {
            return null;
        }

        // OPT: Ignore slash nine from old IE
        if (!kw.saveie && this.slash_nine) {
            return null;
        }

        // OPT: Remove unsupported declarations.
        if (!browser_support.supportsDeclaration(this.ident, kw)) {
            return null;
        }

        kw.declarationName = this.ident;
        this.expr = optimization.try_(this.expr, kw);
        delete kw.declarationName;

        // OPT: Remove mismatched vendor prefixes in declarations.
        if (kw.vendorPrefix && this.ident.match(/\-[a-z]+\-.+/)) {
            if (this.ident.substr(0, kw.vendorPrefix.length) !== kw.vendorPrefix) {
                return null;
            }
        }

        return this;
    };
};

exports.URI = function(uri) {
    uri = uri.trim();
    if (uri[0] === uri[uri.length - 1] && (uri[0] === '"' || uri[0] === "'") ||
        uri.indexOf(')') !== -1) {

        uri = new exports.String(uri.substring(1, uri.length - 1));
    }

    this.uri = uri;

    this.asString = function() {
        if (this.uri instanceof exports.String)
            return this.uri;
        return new exports.String(this.uri);
    };

    this.toString = function toString() {
        var uri = this.uri;
        if (typeof uri === 'string' && uri.indexOf(')') !== -1) {
            uri = new exports.String(uri);
        } else if (typeof uri === 'string') {
            return 'url(' + uri + ')';
        }
        return 'url(' + uri.asString(uri.asString(true).indexOf(')') === -1) + ')';
    };
    this.pretty = function pretty(indent) {return this.toString();};
    this.optimize = function optimize(kw) {return this;};
};

exports.Expression = function(chain) {
    this.chain = chain;

    this.toString = function toString() {
        var output = '';
        for (var i = 0; i < this.chain.length; i++) {
            if (i) {
                output += this.chain[i][0] || ' ';
            }
            output += this.chain[i][1].toString();
        }
        return output;
    };
    this.pretty = function pretty(indent) {
        var output = '';
        for (var i = 0; i < this.chain.length; i++) {
            if (i) {
                if (this.chain[i][0] === ',')
                    output += ', ';
                else if (!this.chain[i][0])
                    output += ' ';
                else
                    output += this.chain[i][0];
            }
            var val = this.chain[i][1];
            if (val.pretty)
                output += val.pretty(indent);
            else
                output += val.toString();
        }
        return output;
    };
    this.optimize = function optimize(kw) {
        this.chain = this.chain.map(function(v) {
            return [v[0], optimization.try_(v[1], kw)];
        }).filter(function(v) {
            return !!v[1];
        });

        if (!kw.declarationName) return this;

        // OPT: Try to minify lists of lengths.
        // e.g.: `margin:0 0 0 0` -> `margin:0`
        if (kw.declarationName in optimization.quadLists &&
            this.chain.length > 2 &&
            this.chain.length <= 4) {
            var keys = this.chain.map(function(v) {
                return v[1].toString();
            });
            if (keys[0] == keys[1] && keys[1] === keys[2] && keys[2] === keys[3]) {
                this.chain = [this.chain[0]];
                return this;
            }
            if (keys.length === 4 && keys[0] === keys[2] && keys[1] === keys[3]) {
                this.chain = [this.chain[0], this.chain[1]];
                keys = [keys[0], keys[2]];
            } else if (keys.length === 4 && keys[1] === keys[3]) {
                this.chain = this.chain.slice(0, 3);
                keys = keys.slice(0, 3);
            }
            if (keys.length === 3 && keys[0] === keys[2]) {
                this.chain = this.chain.slice(0, 2);
            }
        } else if (kw.declarationName === 'font-weight' ||
                   kw.declarationName === 'font') {
            this.chain = this.chain.map(function(chunk) {
                // OPT: font/font-weight: normal -> 400
                if (chunk[1].toString() === 'normal')
                    return [chunk[0], '400'];
                // OPT: font/font-weight: bold -> 700
                else if (chunk[1].toString() === 'bold')
                    return [chunk[0], '700'];
                else
                    return chunk;
            });
        }

        if (kw.declarationName in optimization.noneables &&
            this.chain.length === 1 &&
            this.chain[0][1].toString() === 'none') {
            // OPT: none -> 0 where possible.
            this.chain[0][1] = '0';
        }

        // OPT: Convert color names to hex when possible.
        this.chain.forEach(function(term) {
            if (typeof term[1] === 'string' && term[1] in colors.COLOR_TO_HEX) {
                term[1] = new exports.HexColor(colors.COLOR_TO_HEX[term[1]]);
            }
        });

        return this;
    };
};

exports.Dimension = function(number, unit) {
    this.number = number;
    this.unit = unit || '';

    this.toString = function toString() {
        if (Math.abs(this.number.value) === 0 && this.unit !== '%')
            return '0';
        else
            return this.number.toString() + this.unit;
    };
    this.pretty = function pretty(indent) {
        return this.number.pretty(indent) + (this.unit || '');
    };
    this.optimize = function optimize(kw) {
        if (!this.unit) {
            return this.number;
        }
        if (kw.func !== 'hsl' && kw.func !== 'hsla' && Math.abs(this.number.value) === 0) {
            return this.number;
        }
        return optimization.unit(this, kw);
    };
};

exports.Func = function(name, content) {
    this.name = name;
    this.content = content;

    this.toString = function toString() {
        return this.name + '(' + this.content.toString() + ')';
    };
    this.pretty = function pretty(indent) {
        return this.name + '(' + this.content.pretty(indent) + ')';
    };
    this.optimize = function optimize(kw) {
        var me = this;
        function asRealNum(num) {
            if (num.unit && num.unit === '%') num = num.number;
            return num.asNumber();
        }

        // OPT: Lowercase function names.
        this.name = this.name.toLowerCase();
        var oldkwf = kw.func;
        kw.func = this.name;
        this.content = optimization.try_(this.content, kw);

        // OPT: Convert color functions to shortest variants.
        if (this.content &&
            this.content.chain &&
            utils.all(
                this.content.chain,
                function(x) {
                    return utils.isPositiveNum(x[1]) ||
                           (x[1].unit && x[1].unit === '%' && utils.isPositiveNum(x[1].number));
                }
            )) {

            switch(this.name) {
                case 'rgb':
                case 'hsl':
                    if (this.content.chain.length !== 3) return this;
                    break;
                case 'rgba':
                case 'hsla':
                    if (this.content.chain.length !== 4) return this;
                    break;
                default:
                    return this;
            }


            var converter = require('color-convert')();
            var converter_func = converter[this.name.substr(0, 3)];

            var components = this.content.chain.slice(0, 3).map(function(v) {
                return asRealNum(v[1]);
            });
            return optimization.color(
                converter_func.apply(converter, components),
                this.content.chain[3] !== undefined ? asRealNum(this.content.chain[3][1]) : 1
            );
        }

        kw.func = oldkwf;

        return this;
    };
};

exports.MathSum = function(base, operator, term) {
    this.base = base;
    this.operator = operator;
    this.term = term;

    this.toString = function toString(pad) {
        var output = '';
        var base = this.base.toString(pad);
        var term = this.term.toString(pad);
        output += base;
        output += ' ';
        output += this.operator;
        output += ' ';
        output += term;
        return output;
    };
    this.pretty = function pretty(indent) {
        return this.toString(true);
    };
    this.optimize = function optimize(kw) {
        this.base = this.base.optimize(kw);
        this.term = this.term.optimize(kw);
        return this;
    };
};

exports.MathProduct = function(base, operator, term) {
    this.base = base;
    this.operator = operator;
    this.term = term;

    this.toString = function toString(pad) {
        var output = '';
        var base = this.base.toString();
        var term = this.term.toString();
        output += this.base instanceof exports.MathSum ? '(' + base + ')' : base;
        if (pad) output += ' ';
        output += this.operator;
        if (pad) output += ' ';
        output += this.term instanceof exports.MathSum ? '(' + term + ')' : term;
        return output;
    };
    this.pretty = function pretty(indent) {
        return this.toString(true);
    };
    this.optimize = function optimize(kw) {
        this.base = this.base.optimize(kw);
        this.term = this.term.optimize(kw);
        return this;
    };
};


exports.HexColor = require('./nodes/HexColor');
exports.Number = require('./nodes/Number');
exports.String = require('./nodes/String');
