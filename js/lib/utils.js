var opts = module.exports.opts = function(opts, defaults) {
    if (!opts) {
        opts = process.argv;
    }

    var out = defaults || {},
        last, i, is_flag;
    for(i = 0; i < opts.length; i++) {
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

module.exports.joinAll = function(list, joiner, mapper) {
    if (!list) return '';
    mapper = mapper || function(x) {return x.toString();};
    return list.map(mapper).join(joiner || '');
};

var identity = module.exports.identity = function(data) {return data;};
var stringIdentity = module.exports.stringIdentity = function(data) {return data.toString();};
module.exports.invoker = function(method) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(obj) {
        return obj[method].apply(obj, args);
    };
}

module.exports.uniq = function(lambda, list) {
    lambda = lambda || stringIdentity;
    var values = {};
    var count = 0;
    for (var i = 0; i < list.length; i++) {
        var lval = lambda(list[i]);
        if (!(lval in values))
            count++;
        values[lval] = i;
    }
    var output = [];
    for (var key in values) {
        if (!values.hasOwnProperty(key)) continue;
        output.push(list[values[key]]);
    }
    return output;
};

module.exports.all = function(list, test) {
    test = test || identity;
    for (var i = 0; i < list.length; i++) {
        if (!test(list[i])) return false;
    }
    return true;
};

module.exports.any = function(list, test) {
    for (var i = 0; i < list.length; i++) {
        if (test(list[i])) return true;
    }
    return false;
};

var isNum = module.exports.isNum = function(obj) {
    return obj && obj.asNumber;
};

module.exports.isPositiveNum = function(obj) {
    return isNum(obj) && obj.asNumber() >= 0;
};

module.exports.indent = function(value, indent) {
    if (!value) return '';
    indent = indent || 0;
    var output = '';
    for (var i = 0; i < indent; i++) {
        output += '  ';
    }
    return output + value;
};

module.exports.prettyMap = function(indent) {
    return function(x) {
        return (x.pretty ? x.pretty(indent) : x.toString());
    };
}
