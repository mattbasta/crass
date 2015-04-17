var opts = module.exports.opts = function opts(opts, defaults) {
    if (!opts) {
        opts = process.argv;
    }

    var out = defaults || {},
        last, i, is_flag;
    for (i = 0; i < opts.length; i++) {
        is_flag = opts[i].substr(0, 1) === '-';
        if (is_flag && last) {
            out[last] = true;
        } else if (!is_flag && last) {
            out[last] = opts[i];
        }
        last = is_flag ? opts[i].replace(/^\-+/, '') : null;
    }
    if (last) out[last] = true;
    return out;
};

module.exports.joinAll = function joinAll(list, joiner, mapper) {
    if (!list) return '';
    mapper = mapper || function joinAllDefaultMapper(x) {return x.toString();};
    return list.map(mapper).join(joiner || '');
};

var identity = module.exports.identity = function identity(data) {return data;};
var stringIdentity = module.exports.stringIdentity = function stringIdentity(data) {return data.toString();};

module.exports.uniq = function uniq(lambda, list) {
    lambda = lambda || stringIdentity;
    var values = {};
    for (var i = 0; i < list.length; i++) {
        var lval = lambda(list[i]);
        values[lval] = i;
    }
    var output = [];
    for (var key in values) {
        output.push(list[values[key]]);
    }
    return output;
};

module.exports.all = function all(list, test) {
    test = test || identity;
    for (var i = 0; i < list.length; i++) {
        if (!test(list[i])) return false;
    }
    return true;
};

module.exports.any = function any(list, test) {
    for (var i = 0; i < list.length; i++) {
        if (test(list[i])) return true;
    }
    return false;
};

var isNum = module.exports.isNum = function isNum(obj) {
    return obj && obj.asNumber;
};

module.exports.isPositiveNum = function isPositiveNum(obj) {
    return isNum(obj) && obj.asNumber() >= 0;
};

module.exports.indent = function indent(value, indent) {
    if (!value) return '';
    indent = indent || 0;
    var output = '';
    for (var i = 0; i < indent; i++) {
        output += '  ';
    }
    return output + value;
};

module.exports.prettyMap = function prettyMap(indent) {
    return function prettyMapper(x) {
        return x.pretty ? x.pretty(indent) : x.toString();
    };
};


module.exports.extend = function extend(base, extension) {
    for (var i in extension) {
        if (!extension.hasOwnProperty(i)) continue;
        base[i] = extension[i];
    }
};
