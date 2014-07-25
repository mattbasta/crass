
var extend = exports.extend = function(base, extension) {
    for (var i in extension) {
        if (!extension.hasOwnProperty(i)) continue;
        base[i] = extension[i];
    }
};

var browser_support = require('./browser_support');
var colors = require('./colors');
var utils = require('./utils');
var optimization = require('./optimization');

exports.Stylesheet = function(charset, imports, namespaces, content) {
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
    this.pretty = function(indent) {
        indent = indent || 0;
        var output = '';
        if (this.charset) output += this.charset.pretty(indent);
        if (this.imports.length)
            output += utils.joinAll(this.imports, null, utils.prettyMap(indent));
        if (this.namespaces.length)
            output += utils.joinAll(this.namespaces, null, utils.prettyMap(indent));
        if (this.content.length)
            output += utils.joinAll(this.content, null, utils.prettyMap(indent));
        return output;
    };
    this.optimize = function(kw) {
        kw = kw || {};
        if (this.charset) {
            this.charset = optimization.try_(this.charset, kw);
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

exports.Charset = function(charset) {
    this.charset = charset;

    this.toString = function() {
        return '@charset ' + this.charset.toString() + ';';
    };
    this.pretty = function(indent) {
        return this.toString() + '\n';
    };
    this.optimize = function(kw) {return this;};
};

exports.Import = function(uri, medium_list) {
    this.uri = uri;
    this.medium_list = medium_list;

    this.toString = function() {
        if (this.medium_list) {
            return '@import ' + this.uri.asString() + ' ' + this.medium_list.toString() + ';';
        } else {
            return '@import ' + this.uri.asString() + ';';
        }
    };
    this.pretty = function(indent) {
        return this.toString() + '\n';
    };
    this.optimize = function(kw) {return this;};
};

exports.Namespace = function(uri, name) {
    this.uri = uri;
    this.name = name;

    this.toString = function() {
        if (this.name)
            return '@namespace ' + this.name + ' ' + this.uri.toString() + ';';
        else
            return '@namespace ' + this.uri.toString() + ';';
    };
    this.pretty = function(indent) {
        return this.toString() + '\n';
    };
    this.optimize = function(kw) {return this;};
};

exports.Media = function(medium_list, content) {
    this.medium_list = medium_list || [];
    this.content = content;

    this.toString = function() {
        return '@media ' + utils.joinAll(this.medium_list, ',') + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {
        var output = '';
        output += utils.indent('@media ' + utils.joinAll(this.medium_list, ', ', utils.prettyMap(indent)) + ' {') + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1), indent);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        this.medium_list = optimization.optimizeList(this.medium_list, kw);
        this.content = optimization.optimizeBlocks(this.content, kw);

        // OPT: Remove duplicate media queries.
        this.medium_list = utils.uniq(null, this.medium_list);

        return this;
    };
};

exports.MediaQuery = function(type, prefix, expression) {
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
    this.pretty = function(indent) {
        var output = [];
        if (this.type) {
            if (this.prefix) output.push(this.prefix);
            output.push(this.type);
        }
        if (this.type && this.expression.length) output.push('and');
        if (this.expression.length) {
            output.push(utils.joinAll(this.expression, ' and ', utils.prettyMap(indent)));
        }
        return output.join(' ');
    };
    this.optimize = function(kw) {
        // TODO(opt): sort expressions
        // TODO(opt): filter bunk expressions
        // OPT: Remove duplicate media expressions
        this.expression = utils.uniq(null, this.expression);
        this.expression = optimization.optimizeList(this.expression, kw);
        return this;
    };
};

exports.MediaExpression = function(descriptor, value) {
    this.descriptor = descriptor;
    this.value = value;

    this.toString = function() {
        if (this.value) {
            return '(' + this.descriptor.toString() + ':' + this.value.toString() + ')';
        } else {
            return '(' + this.descriptor.toString() + ')';
        }
    };
    this.pretty = function(indent) {
        if (this.value) {
            return '(' + this.descriptor.toString() + ': ' + this.value.pretty(indent) + ')';
        } else {
            return '(' + this.descriptor.toString() + ')';
        }
    };
    this.optimize = function(kw) {
        this.value = optimization.try_(this.value, kw);
        return this;
    };
};

exports.Page = function(name, content) {
    this.name = name;
    this.content = content;

    this.toString = function() {
        return '@page ' + this.name + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {
        var output = '';
        output += utils.indent('@page ' + this.name + ' {') + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        this.content = optimization.optimizeBlocks(this.content, kw);
        return this;
    };
};

exports.PageMargin = function(margin, content) {
    this.margin = margin;
    this.content = content;

    this.toString = function() {
        return '@' + this.margin + '{' + utils.joinAll(this.content) + '}';
    };
    this.pretty = function(indent) {
        var output = '';
        output += utils.indent('@' + this.margin + ' {') + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    };
};

exports.FontFace = function(content) {
    this.content = content;

    this.toString = function() {
        return '@font-face{' + utils.joinAll(this.content, ';') + '}';
    };
    this.pretty = function(indent) {
        var output = '';
        output += utils.indent('@font-face {') + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    };
};

exports.Keyframes = function(name, content, vendor_prefix) {
    this.name = name;
    this.content = content;
    this.vendor_prefix = vendor_prefix;

    this.get_block_header = function() {
        if (this.vendor_prefix)
            return '@' + this.vendor_prefix + 'keyframes ';
        else
            return '@keyframes ';
    };

    this.toString = function() {
        var output = this.get_block_header();
        output += this.name;
        output += '{';
        output += utils.joinAll(this.content);
        output += '}';
        return output;
    };
    this.pretty = function(indent) {
        var output = '';
        output += utils.indent(this.get_block_header() + this.name + ' {') + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1), indent);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        var orig_prefix = kw.vendor_prefix;

        // OPT: Remove unsupported keyframes blocks.
        if (!browser_support.supportsKeyframe(this.vendor_prefix, kw)) {
            return null;
        }

        if (orig_prefix && this.vendor_prefix && this.vendor_prefix !== orig_prefix) {
            // OPT: Eliminate keyframes that don't match media query.
            return;
        } else if (this.vendor_prefix) {
            kw.vendor_prefix = this.vendor_prefix;
        }

        // OPT: Combine keyframes with identical stops.
        this.content = optimization.combineList(
            function(item) {return item.stop.toString();},
            function(a, b) {
                return new (exports.Keyframe)(a.stop, a.content.concat(b.content));
            },
            this.content
        );
        // OPT: Sort keyframes.
        this.content = this.content.sort(function(a, b) {
            var astr = a.stop.toString();
            var bstr = b.stop.toString();
            if (astr < bstr)
                return -1;
            else if (astr > bstr)
                return 1;
            return 0;
        });

        this.content = optimization.optimizeBlocks(this.content, kw);
        if (!orig_prefix) {
            delete kw.vendor_prefix;
        }

        return this;
    };
};

exports.Keyframe = function(stop, content) {
    this.stop = stop;
    this.content = content;

    this.toString = function() {
        return utils.joinAll(this.stop, ',') + '{' + utils.joinAll(this.content, ';') + '}';
    };
    this.pretty = function(indent) {
        var output = '';
        output += utils.indent(
            utils.joinAll(
                this.stop, ', ',
                function(x) {return x.pretty(indent);}
            ) + ' {',
            indent) + '\n';
        output += this.content.map(function(line) {
            return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
        }).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        this.stop = optimization.try_(this.stop, kw);
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    };
};

exports.KeyframeSelector = function(stop) {
    this.stop = stop;

    this.toString = function() {
        return this.stop;
    };
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
        // TODO(opt): Convert to/from into percents and vise versa.
        return this;
    };
};


exports.Supports = function(condition_list, blocks) {
    this.condition_list = condition_list;
    this.blocks = blocks;

    this.toString = function() {
        var output = '@supports ';
        var cond_is_decl = this.condition_list instanceof exports.Declaration;
        if (cond_is_decl) output += '(';
        output += this.condition_list.toString();
        if (cond_is_decl) output += ')';
        output += '{';
        output += utils.joinAll(this.blocks);
        output += '}';
        return output;
    };
    this.pretty = function(indent) {
        var condition_list = this.condition_list.pretty(indent);
        if (this.condition_list instanceof exports.Declaration) {
            condition_list = '(' + condition_list + ')';
        }

        var output = utils.indent(
            '@supports ' + condition_list + ' {',
            indent
        ) + '\n';
        output += this.blocks.map(function(line) {
            return utils.indent(line.pretty(indent + 1), indent);
        }).join('\n');
        output += utils.indent('}', indent) + '\n';
        return output;
    };
    this.optimize = function(kw) {
        this.condition_list = this.condition_list.optimize(kw);
        this.blocks = optimization.optimizeBlocks(this.blocks, kw);
        return this;
    };
};

exports.SupportsConditionList = function(combinator, conditions) {
    this.combinator = combinator;
    this.conditions = conditions;

    this.unshift = function(item) {
        this.conditions.unshift(item);
    };
    this.push = function(item) {
        this.conditions.push(item);
    };

    this.toString = function() {
        return utils.joinAll(
            this.conditions,
            ' ' + this.combinator + ' ',
            function(item) {
                var output = item.toString();
                return (item instanceof exports.SupportsConditionList && item.combinator !== this.combinator ||
                        item instanceof exports.Declaration) ? '(' + output + ')' : output;
            }
        );
    };
    this.pretty = function(indent) {
        return this.toString();
    };
    this.optimize = function(kw) {
        this.conditions = this.conditions.map(function(condition) {
            return condition.optimize(kw);
        });
        // OPT: Remove duplicate delcarations in @supports condition lists
        this.conditions = utils.uniq(null, this.conditions);

        // OPT: not(x) and not(y) and not(z) -> not(x or y or z)
        if (utils.all(this.conditions, function(condition) {
            return condition instanceof exports.SupportsCondition && condition.negated;
        })) {
            var cond = new exports.SupportsCondition(new exports.SupportsConditionList(
                this.combinator === 'and' ? 'or' : 'and',
                this.conditions.map(function(condition) {
                    return condition.condition;
                })
            ));
            cond.negate();
            return cond;
        }

        return this;
    };
};
exports.createSupportsConditionList = function(base, combinator, addon) {
    if (base instanceof exports.SupportsConditionList && base.combinator === combinator) {
        base.push(addon);
        return base;
    } else if (addon instanceof exports.SupportsConditionList && addon.combinator === combinator) {
        addon.unshift(base);
        return addon;
    } else {
        return new (exports.SupportsConditionList)(combinator, [base, addon]);
    }
};

exports.SupportsCondition = function(condition) {
    this.condition = condition;
    this.negated = false;

    this.negate = function() {
        this.negated = !this.negated;
    };

    this.toString = function() {
        var output = '';
        if (this.negated) output = 'not ';
        output += '(';
        output += this.condition;
        output += ')';
        return output;
    };
    this.pretty = function(indent) {
        return this.toString();
    };
    this.optimize = function(kw) {
        this.condition = this.condition.optimize(kw);
        // OPT: not(not(foo:bar)) -> (foo:bar)
        if (this.condition instanceof exports.SupportsCondition &&
            this.negated && this.condition.negated) {
            return this.condition.condition;
        }
        return this;
    };
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

    this.toString = function() {
        return this.selector.toString() + '{' + this.contentToString() + '}';
    };
    this.pretty = function(indent) {
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
    this.optimize = function(kw) {
        if (this.selector)
            this.selector = optimization.try_(this.selector, kw);

        this.optimizeContent(kw);

        // OPT: Remove empty rulsets.
        if (!this.content.length) {
            return null;
        }
        return this;
    };
};

exports.SelectorList = function(selectors) {
    this.selectors = selectors || [];

    this.push = function(selector) {
        this.selectors.push(selector);
    };

    this.toString = function() {
        return utils.joinAll(this.selectors, ',');
    };
    this.pretty = function(indent) {
        var separator = this.toString().length < 80 ? ', ' : ',\n' + utils.indent(' ', indent).substr(1);
        return utils.joinAll(this.selectors, separator, utils.prettyMap(indent));
    };
    this.optimize = function(kw) {
        this.selectors = optimization.optimizeList(this.selectors, kw);
        // OPT: Sort selector lists.
        this.selectors = this.selectors.sort(function(a, b) {
            var ats = a.toString();
            var bts = b.toString();
            return ats < bts ? -1 : 1;
        });
        // OPT: Remove duplicate selectors in a selector list.
        this.selectors = utils.uniq(null, this.selectors);

        // OPT(O1): `.foo, *` -> `*`
        if (kw.o1 &&
            this.selectors.length > 1 &&
            utils.any(this.selectors, function(i) {return i.toString() === '*';})) {

            this.selectors = [
                new (exports.SimpleSelector)([new (exports.ElementSelector)('*')])
            ];
        }

        // TODO(opt): Merge selectors.
        return this;
    };
};
exports.createSelectorList = function(base, addon) {
    if (base instanceof exports.SelectorList) {
        base.push(addon);
        return base;
    } else {
        return new exports.SelectorList([base, addon]);
    }
};

exports.SimpleSelector = function(conditions) {
    this.conditions = conditions || [];

    this.toString = function() {
        return utils.joinAll(this.conditions);
    };
    this.pretty = function(indent) {
        return utils.joinAll(this.conditions, null, utils.prettyMap(indent));
    };
    this.optimize = function(kw) {
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

        this.toString = function() {
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

exports.IDSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '#' + this.ident;};
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {return this;};
};

exports.ClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '.' + this.ident;};
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {return this;};
};

exports.ElementSelector = function(ident, ns) {
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
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
        // OPT: Lowercase element names.
        this.ident = this.ident.toLowerCase();
        if (this.ns)
            this.ns = this.ns.toLowerCase();
        return this;
    };
};

exports.AttributeSelector = function(ident, comparison, value) {
    this.ident = ident;
    this.comparison = comparison;
    this.value = value;

    this.toString = function() {
        // TODO: Handle quoting/unquoting
        if (this.value) {
            var value = this.value;
            if (value.asString) {
                value = value.asString(true);
            }
            return '[' + this.ident + this.comparison + value + ']';
        } else {
            return '[' + this.ident + ']';
        }
    };
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
        // OPT: Lowercase attribute names.
        if (this.ident.toLowerCase)
            this.ident = this.ident.toLowerCase();
        else if (this.ident.optimize)
            this.ident = optimization.try_(this.ident, kw);
        this.value = optimization.try_(this.value, kw);
        return this;
    };
};

exports.PseudoElementSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return '::' + this.ident;};
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
        // OPT: Lowercase pseudo element names.
        this.ident = this.ident.toLowerCase();
        return this;
    };
};

exports.NthSelector = function(func_name, linear_func) {
    this.func_name = func_name;
    this.linear_func = linear_func;

    this.toString = function() {
        return ':' + this.func_name + '(' + this.linear_func.toString() + ')';
    };
    this.pretty = function(indent) {
        var lf_pretty = this.linear_func.pretty ? this.linear_func.pretty(indent) : this.linear_func.toString();
        return ':' + this.func_name + '(' + lf_pretty + ')';
    };
    this.optimize = function(kw) {
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

    this.toString = function() {
        return ':not(' + this.selector.toString() + ')';
    };
    this.pretty = function(indent) {
        return ':not(' + this.selector.pretty(indent) + ')';
    };
    this.optimize = function(kw) {
        this.selector = optimization.try_(this.selector, kw);
        return this;
    };
};

exports.PseudoSelectorFunction = function(func_name, expr) {
    this.func_name = func_name;
    this.expr = expr;

    this.toString = function() {
        return ':' + this.func_name + '(' + this.expr.toString() + ')';
    };
    this.pretty = function(indent) {
        return ':' + this.func_name + '(' + this.expr.pretty(indent) + ')';
    };
    this.optimize = function(kw) {
        // OPT: Lowercase pseudo function names.
        this.func_name = this.func_name.toLowerCase();
        this.expr = optimization.try_(this.expr, kw);
        return this;
    };
};

exports.PseudoClassSelector = function(ident) {
    this.ident = ident;

    this.toString = function() {return ':' + this.ident;};
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
        // OPT: Lowercase pseudo class names.
        this.ident = this.ident.toLowerCase();
        return this;
    };
};

exports.LinearFunction = function(n_val, offset) {
    this.n_val = n_val;
    this.offset = offset;

    this.toString = function(pad) {
        if (this.n_val) {
            var operator = pad ? ' + ' : '+';
            if (this.offset.value < 0) {
                operator = pad ? ' - ' : '-';
            }
            return this.n_val.toString() + operator + this.offset.toString(true);
        } else {
            return this.offset.toString();
        }
    };
    this.pretty = function(indent) {return this.toString(true);};
    this.optimize = function(kw) {
        this.n_val = optimization.try_(this.n_val, kw);
        return this;
    };
};

exports.NValue = function(coef) {
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
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {return this;};
};

exports.IEFilter = function(blob) {
    this.ident = 'filter';  // Hack so that we can duck-type this as a Declaration.
    this.blob = blob;

    this.toString = function() {return this.blob;};
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
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

    this.toString = function() {
        return this.ident + ':' + this.expr.toString() +
            (this.important ? '!important' : '') +
            (this.slash_nine ? '\\9' : '');
    };
    this.pretty = function(indent) {
        return this.ident + ': ' + this.expr.pretty(indent) +
            (this.important ? ' !important' : '') +
            (this.slash_nine ? ' \\9' : '');
    };
    this.optimize = function(kw) {

        // OPT: Lowercase descriptor names.
        this.ident = this.ident.toLowerCase();

        // OPT: Remove unsupported declarations.
        if (!browser_support.supportsDeclaration(this.ident, kw)) {
            return null;
        }

        kw.declarationName = this.ident;
        this.expr = optimization.try_(this.expr, kw);
        delete kw.declarationName;

        // OPT: Remove mismatched vendor prefixes in declarations.
        if (kw.vendor_prefix && this.ident.match(/\-[a-z]+\-.+/)) {
            if (this.ident.substr(0, kw.vendor_prefix.length) !== kw.vendor_prefix) {
                return null;
            }
        }

        return this;
    };
};

exports.URI = function(uri) {
    uri = uri.trim();
    if (uri[0] === uri[uri.length - 1] &&
        (uri[0] === '"' || uri[0] === "'"))
        uri = new exports.String(uri.substring(1, uri.length - 1));

    this.uri = uri;

    this.asString = function() {
        if (this.uri instanceof exports.String)
            return this.uri;
        return new exports.String(this.uri);
    };

    this.toString = function() {
        var uri = this.uri;
        if (typeof uri === 'string' && uri.indexOf(')') !== -1) {
            uri = new exports.String(uri);
        }
        return 'url(' + uri.toString(true) + ')';
    };
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {return this;};
};

exports.Expression = function(chain) {
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
    this.pretty = function(indent) {
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
    this.optimize = function(kw) {
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

    this.toString = function() {
        if (this.unit && this.number.value)
            return this.number.toString() + this.unit;
        else if (Math.abs(this.number.value) === 0 && this.unit !== '%')
            return '0';
        else
            return this.number.toString();
    };
    this.pretty = function(indent) {
        return this.number.pretty(indent) + (this.unit || '');
    };
    this.optimize = function(kw) {
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
    this.content = content || {};

    this.toString = function() {
        return this.name + '(' + this.content.toString() + ')';
    };
    this.pretty = function(indent) {
        if (this.content.pretty)
            return this.name + '(' + this.content.pretty(indent) + ')';
        else
            return this.name + '(' + this.content.toString() + ')';
    };
    this.optimize = function(kw) {
        var me = this;
        function asRealNum(num) {
            if (typeof num === 'number') return num;
            if (num.unit && num.unit === '%') num = num.number;
            if (num.asNumber) return num.asNumber();
            return Number(num.toString());
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

    this.toString = function(pad) {
        var output = '';
        var base = this.base.toString();
        var term = this.term.toString();
        output += this.base instanceof exports.MathProduct ? '(' + base + ')' : base;
        if (pad) output += ' ';
        output += this.operator;
        if (pad) output += ' ';
        output += this.term instanceof exports.MathProduct ? '(' + term + ')' : term;
        return output;
    };
    this.pretty = function(indent) {
        return this.toString(true);
    };
    this.optimize = function(kw) {
        this.base = this.base.optimize(kw);
        this.term = this.term.optimize(kw);
        return this;
    };
};

exports.MathProduct = function(base, operator, term) {
    this.base = base;
    this.operator = operator;
    this.term = term;

    this.toString = function(pad) {
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
    this.pretty = function(indent) {
        return this.toString(true);
    };
    this.optimize = function(kw) {
        this.base = this.base.optimize(kw);
        this.term = this.term.optimize(kw);
        return this;
    };
};

exports.HexColor = function(color) {
    this.color = color;

    this.toString = function() {
        return this.color;
    };
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {
        // OPT: Lowercase hex colors.
        this.color = this.color.toLowerCase();
        // OPT: Shorten hex colors
        this.color = optimization.shortenHexColor(this.color);
        // OPT: Convert hex -> name when possible.
        if (this.color in colors.HEX_TO_COLOR) {
            return colors.HEX_TO_COLOR[this.color];
        }

        return this;
    };
};

exports.Number = function(value) {
    this.value = Number(value);
    if (Number.isNaN(this.value)) {
        this.value = 0;
    }

    this.applySign = function(sign) {
        if (sign === '-') {
            this.value *= -1;
        }
    };

    this.asNumber = function() {
        return this.value;
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

        function truncate(num) {
            // This will truncate all numbers to four decimal places.
            if (num % 1) {
                if (Math.abs(Math.round(num) - num) < 0.00001) return Math.round(num).toString();

                var decimal = (num % 1).toString().substr(1, 5);
                num = Math.floor(num).toString();
                // Trim trailing zeroes
                while (decimal[decimal.length - 1] === '0') decimal = decimal.substr(0, decimal.length - 1);
                if (decimal !== '.')
                    num += decimal;
                return num;
            } else {
                return num.toString();
            }
        }
        if (positive) {
            return post(truncate(Math.abs(this.value)));
        }
        return post(truncate(this.value));
    };
    this.pretty = function(indent) {
        return this.value.toString();
    };
    this.optimize = function(kw) {
        // TODO(opt): rounding and stuff
        return this;
    };
};

exports.String = function(value) {
    this.value = value.toString().replace(/\\(['"])/g, '$1');

    this.asString = this.toString = function(raw) {
        if (raw && this.value.indexOf('\\') === -1) {
            return this.value;
        }
        var single_ = "'" + this.value.replace(/'/g, "\\'") + "'";
        var double_ = '"' + this.value.replace(/"/g, '\\"') + '"';
        return (single_.length < double_.length) ? single_ : double_;
    };
    this.pretty = function(indent) {return this.toString();};
    this.optimize = function(kw) {return this;};
};
