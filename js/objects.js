if (typeof require !== 'undefined') {
    var scope = exports;
} else {
    var scope = parser.yy;
}

var extend = scope.extend = function(base, extension) {
    for (var i in extension) {
        if (!extension.hasOwnProperty(i)) continue;
        base[i] = extension[i];
    }
};


var utils = require('./utils');

scope.Stylesheet = function(charset, imports, namespaces, content) {
    this.charset = charset;
    this.imports = imports || [];
    this.namespaces = namespaces || [];
    this.content = content || [];

    this.toString = function() {
        var output = '';
        if (this.charset) output += this.charset.toString();
        if (this.imports.length)
            output += utils.joinAll(this.imports);
        if (this.namespaces.length)
            output += utils.joinAll(this.namespaces);
        if (this.content.length)
            output += utils.joinAll(this.content);
        return output;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Charset = function(charset) {
    this.charset = charset;

    this.toString = function() {
        return '@charset "' + this.charset + '";';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Import = function(uri, medium_list) {
    this.uri = uri;
    this.medium_list = medium_list;

    this.toString = function() {
        if (this.medium_list) {
            return '@import "' + this.uri + '" ' + this.medium_list.toString() + ';';
        } else {
            return '@import "' + this.uri + '";';
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Namespace = function(uri, name) {
    this.uri = uri;
    this.name = name;

    this.toString = function() {
        if (this.name) {
            return '@namespace ' + this.name + ' "' + this.uri.toString() + '";';
        } else {
            return '@namespace "' + this.uri.toString() + '";';
        };
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Media = function(medium_list, content) {
    this.medium_list = medium_list;
    this.content = content;

    this.toString = function() {
        return '@media ' + utils.joinAll(this.medium_list, ',') + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.MediaQuery = function(type, prefix, expression) {
    this.type = type;
    this.prefix = prefix;
    this.expression = expression || [];

    this.toString = function() {
        var output = [];
        if (this.type) {
            if (this.prefix) output.push(this.prefix);
            output.push(this.type);
        }
        if (this.type && this.expression.length) output.push('and');
        if (this.expression.length) {
            output.push(utils.joinAll(this.expression, 'and'));
        }
        return output.join(' ');
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
}

scope.MediaExpression = function(descriptor, value) {
    this.descriptor = descriptor;
    this.value = value;

    this.toString = function() {
        if (this.value) {
            return '(' + this.descriptor.toString() + ':' + this.value.toString() + ')';
        } else {
            return '(' + this.descriptor.toString() + ')';
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Page = function(name, content) {
    this.name = name;
    this.content = content;

    this.toString = function() {
        return '@page ' + this.name + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.PageMargin = function(margin, content) {
    this.margin = margin;
    this.content = content;

    this.toString = function() {
        return '@' + this.margin + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.FontFace = function(content) {
    this.content = content;

    this.toString = function() {
        return '@font-face{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Keyframes = function(name, content, vendor_prefix) {
    this.name = name;
    this.content = content;
    this.vendor_prefix = vendor_prefix;

    this.toString = function() {
        var output = '@keyframes ';
        if (this.vendor_prefix) {
            output = '@' + this.vendor_prefix + 'keyframes ';
        }
        output += this.name;
        output += '{';
        output += utils.joinAll(this.content);
        output += '}';
        return output;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Keyframe = function(stop, content) {
    this.stop = stop;
    this.content = content;

    this.toString = function() {
        return utils.joinAll(this.stop, ',') + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.KeyframeSelector = function(stop) {
    this.stop = stop;

    this.toString = function() {
        return this.stop;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Ruleset = function(selector, content) {
    this.selector = selector;
    this.content = content;

    this.toString = function() {
        return this.selector.toString() + '{' + utils.joinAll(this.content, ';') + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.SelectorList = function(selectors) {
    this.selectors = selectors;

    this.push = function(selector) {
        this.selectors.push(selector);
    };

    this.toString = function() {
        return utils.joinAll(this.selectors, ',');
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

function selectorChain(type, options) {
    options = options || {};
    return function(ancestor, descendant) {
        // ancestor should always be the "l-value"
        // descendant should always be the "r-value"
        this.ancestor = ancestor;
        this.descendant = descendant;

        this.toString = function() {
            return ancestor.toString() + type + descendant.toString();
        };
        this.pretty = options.pretty || function(indent) {};
        this.optimize = options.optimize || function(kw) {};
    };
}

scope.AdjacentSelector = selectorChain('+');
scope.DirectDescendantSelector = selectorChain('>');
scope.SiblingSelector = selectorChain('~');
scope.DescendantSelector = selectorChain(' ');

scope.IDSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '#' + this.ident;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.ClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '.' + this.ident;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.ElementSelector = function(ident, ns) {
    this.ident = ident;
    this.ns = ns;

    this.toString = function() {
        if (this.ident && this.ns) {
            return this.ident + '|' + this.ns;
        } else if (this.ns) {
            return '|' + this.ns;
        } else {
            return this.ident;
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.AttributeSelector = function(ident, comparison, value) {
    this.ident = ident;
    this.comparison = comparison;
    this.value = value;

    this.toString = function() {
        // TODO: Handle quoting/unquoting
        if (this.value) {
            return '[' + this.ident + this.comparison + this.value + ']';
        } else {
            return '[' + this.ident + ']';
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.PseudoElementSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '::' + this.ident;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.NthSelector = function(func_name, linear_func) {
    this.func_name = func_name;
    this.linear_func = linear_func;

    this.toString = function() {
        return ':' + this.func_name + '(' + this.linear_func.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.NotSelector = function(selector) {
    this.selector = selector;

    this.toString = function() {
        return ':not(' + this.selector.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.PseudoSelectorFunction = function(func_name, expr) {
    this.func_name = func_name;
    this.expr = expr;

    this.toString = function() {
        return ':' + this.func_name + '(' + this.expr.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.PseudoClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return ':' + this.ident;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.LinearFunction = function(n_val, offset) {
    this.n_val = n_val;
    this.offset = offset;

    this.toString = function() {
        if (this.n_val) {
            var operator = '+';
            if (this.offset.value < 0) {
                operator = '-';
            }
            return this.n_val.toString() + operator + this.offset.toString(true);
        } else {
            return this.offset.toString();
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.NValue = function(coef) {
    this.coef = coef;

    this.toString = function() {
        if (this.coef === 1) {
            return 'n';
        } else if (!this.coef) {
            return '0';
        } else {
            return this.coef.toString() + 'n';
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.IEFilter = function(blob) {
    this.blob = blob;

    this.toString = function() {return this.blob;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Declaration = function(ident, expr) {
    this.ident = ident;
    this.expr = expr;

    this.toString = function() {
        return this.ident + ':' + this.expr.toString();
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.URI = function(uri) {
    this.uri = uri;

    this.toString = function() {
        var uri = this.uri;
        // TODO: Add logic for quoting here.
        return 'url(' + uri + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Expression = function(chain) {
    this.chain = chain;

    this.toString = function() {
        var output = '';
        for (var i = 0; i < this.chain.length; i++) {
            if (i) {
                output += this.chain[i][0] || ' ';
            }
            output += this.chain[i][1].toString();
        }
        return output;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Dimension = function(number, unit) {
    this.number = number;
    this.unit = unit;

    this.toString = function() {
        return this.number.toString() + this.unit;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Func = function(name, content) {
    this.name = name;
    this.content = content;

    this.toString = function() {
        return this.name + '(' + this.content.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.HexColor = function(color) {
    this.color = color;

    this.toString = function() {
        return this.color;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {};
};

scope.Number = function(value) {
    this.value = Number(value);
    if (Number.isNaN(this.value)) {
        this.value = '0';
    }

    this.applySign = function(sign) {
        if (sign === '-') {
            this.value *= '-1';
        }
    };

    this.toString = function(positive) {
        if (positive) {
            return Math.abs(this.value).toString();
        }
        return this.value.toString();
    };
};
