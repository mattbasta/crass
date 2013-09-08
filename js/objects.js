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

var utils = require('./lib/utils');
var identity = utils.identity;
var invoker = utils.invoker;
var optimization = require('./lib/optimization');

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
    this.optimize = function(kw) {
        if (this.charset) {
            this.charset = this.charset.optimize(kw);
        }
        if (this.imports.length) {
            this.imports = optimization.optimizeList(this.imports, kw);
        }
        if (this.namespaces) {
            this.namespaces = optimization.optimizeList(this.namespaces, kw);
        }
        this.content = optimization.optimizeBlocks(this.content, kw);
        return this;
    };
};

scope.Charset = function(charset) {
    this.charset = charset;

    this.toString = function() {
        return '@charset ' + this.charset.toString() + ';';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
};

scope.Import = function(uri, medium_list) {
    this.uri = uri;
    this.medium_list = medium_list;

    this.toString = function() {
        if (this.medium_list) {
            return '@import ' + this.uri.asString() + ' ' + this.medium_list.toString() + ';';
        } else {
            return '@import ' + this.uri.asString() + ';';
        }
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
};

scope.Namespace = function(uri, name) {
    this.uri = uri;
    this.name = name;

    this.toString = function() {
        if (this.name) {
            return '@namespace ' + this.name + ' ' + this.uri.toString() + ';';
        } else {
            return '@namespace ' + this.uri.toString() + ';';
        };
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
};

scope.Media = function(medium_list, content) {
    this.medium_list = medium_list || [];
    this.content = content;

    this.toString = function() {
        return '@media ' + utils.joinAll(this.medium_list, ',') + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.medium_list = optimization.optimizeList(this.medium_list);
        this.content = utils.optimizeBlocks(this.content, kw);
        return this;
    };
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
    this.optimize = function(kw) {
        // TODO(opt): sort expressions
        // TODO(opt): filter bunk expressions
        return this;
    };
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
    this.optimize = function(kw) {
        this.value = this.value.optimize(kw);
        return this;
    };
};

scope.Page = function(name, content) {
    this.name = name;
    this.content = content;

    this.toString = function() {
        return '@page ' + this.name + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.content = optimization.optimizeBlocks(this.content, kw);
        return this;
    };
};

scope.PageMargin = function(margin, content) {
    this.margin = margin;
    this.content = content;

    this.toString = function() {
        return '@' + this.margin + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    };
};

scope.FontFace = function(content) {
    this.content = content;

    this.toString = function() {
        return '@font-face{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    };
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
    this.optimize = function(kw) {
        var orig_prefix = kw.vendor_prefix;
        if (orig_prefix && this.vendor_prefix && this.vendor_prefix !== orig_prefix) {
            // OPT: Eliminate keyframes that don't match media query.
            return;
        } else if (this.vendor_prefix) {
            kw.vendor_prefix = this.vendor_prefix;
        }
        this.content = optimization.optimizeBlocks(this.content, kw);
        if (!orig_prefix) {
            delete kw.vendor_prefix;
        }
        return this;
    };
};

scope.Keyframe = function(stop, content) {
    this.stop = stop;
    this.content = content;

    this.toString = function() {
        return utils.joinAll(this.stop, ',') + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.stop = this.stop.optimize(kw);
        this.content = optimization.optimizeBlocks(this.content, kw);
        return this;
    };
};

scope.KeyframeSelector = function(stop) {
    this.stop = stop;

    this.toString = function() {
        return this.stop;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        // TODO(opt): Convert to/from into percents and vise versa.
        return this;
    };
};

scope.Ruleset = function(selector, content) {
    this.selector = selector;
    this.content = content;

    this.toString = function() {
        return this.selector.toString() + '{' + utils.joinAll(this.content, ';') + '}';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.selector = this.selector.optimize(kw);
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    };
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
    this.optimize = function(kw) {
        // TODO(opt): Merge, order, and de-duplicate selectors.
        this.selectors = optimization.optimizeList(this.selectors, kw);
        return this;
    };
};

scope.SimpleSelector = function(conditions) {
    this.conditions = conditions || [];

    this.toString = function() {
        return utils.joinAll(this.conditions);
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.conditions = optimization.optimizeList(this.conditions, kw);
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
    this.optimize = function(kw) {return this;};
};

scope.ClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '.' + this.ident;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
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
    this.optimize = function(kw) {return this;};
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
    this.optimize = function(kw) {return this;};
};

scope.NthSelector = function(func_name, linear_func) {
    this.func_name = func_name;
    this.linear_func = linear_func;

    this.toString = function() {
        return ':' + this.func_name + '(' + this.linear_func.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.linear_func = this.linear_func.optimize(kw);
        return this;
    };
};

scope.NotSelector = function(selector) {
    this.selector = selector;

    this.toString = function() {
        return ':not(' + this.selector.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.selector = this.selector.optimize(kw);
        return this;
    };
};

scope.PseudoSelectorFunction = function(func_name, expr) {
    this.func_name = func_name;
    this.expr = expr;

    this.toString = function() {
        return ':' + this.func_name + '(' + this.expr.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.expr = this.expr.optimize(kw);
        return this;
    };
};

scope.PseudoClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return ':' + this.ident;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
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
    this.optimize = function(kw) {
        this.n_val = this.n_val.optimize(kw);
        return this;
    };
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
    this.optimize = function(kw) {return this;};
};

scope.IEFilter = function(blob) {
    this.blob = blob;

    this.toString = function() {return this.blob;};
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
};

scope.Declaration = function(ident, expr) {
    this.ident = ident;
    this.expr = expr;

    this.toString = function() {
        return this.ident + ':' + this.expr.toString();
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.expr = this.expr.optimize(kw);
        return this;
    };
};

scope.URI = function(uri) {
    uri = uri.trim();
    if (uri[0] === uri[uri.length - 1] &&
        (uri[0] === '"' || uri[0] === "'"))
        uri = new scope.String(uri.substring(1, uri.length - 1));

    this.uri = uri;

    this.asString = function() {
        if (this.uri instanceof scope.String)
            return this.uri;
        return new scope.String(this.uri);
    };

    this.toString = function() {
        var uri = this.uri;
        if (typeof uri === 'string' && uri.indexOf(')') !== -1) {
            uri = new scope.String(uri);
        }
        return 'url(' + uri.toString(true) + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
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
    this.optimize = function(kw) {
        this.chain = optimization.optimizeList(this.chain, kw);
        return this;
    };
};

scope.Dimension = function(number, unit) {
    this.number = number;
    this.unit = unit;

    this.toString = function() {
        if (this.unit)
            return this.number.toString() + this.unit;
        else
            return this.number.toString();
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
};

scope.Func = function(name, content) {
    this.name = name;
    this.content = content;

    this.toString = function() {
        return this.name + '(' + this.content.toString() + ')';
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        this.content = this.content.optimize(kw);
        return this;
    };
};

scope.HexColor = function(color) {
    if (color.length === 7 &&
        color[1] === color[2] &&
        color[3] === color[4] &&
        color[5] === color[6]) {
        color = '#' + color[1] + color[3] + color[5];
    }
    this.color = color;

    this.toString = function() {
        return this.color;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        // TODO(opt): convert hexcolors
        return this;
    };
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
        function post(str) {
            if (str.length === 1) {
                return str;
            }
            if (str[0] === '0' && str[1] === '.') {
                str = str.substr(1);
            } else if (str[0] === '-' && str[1] === '0' && str[2] === '.') {
                str = '-' + str.substr(2);
            }
            return str;
        }
        if (positive) {
            return post(Math.abs(this.value).toString());
        }
        return post(this.value.toString());
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {
        // TODO(opt): rounding and stuff
        return this;
    };
};

scope.String = function(value) {
    this.value = value.toString().replace(/\\['"]/g, '$1');

    this.asString = this.toString = function(raw) {
        if (raw && this.value.indexOf('\\') === -1) {
            return this.value;
        }
        var single_ = "'" + this.value.replace(/'/g, "\\'") + "'";
        var double_ = '"' + this.value.replace(/"/g, '\\"') + '"';
        return (single_.length < double_.length) ? single_ : double_;
    };
    this.pretty = function(indent) {};
    this.optimize = function(kw) {return this;};
}
