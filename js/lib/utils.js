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

module.exports.joinAll = function(list, joiner) {
    return list.map(function(i) {return i.toString();}).join(joiner || '');
};

var identity = module.exports.identity = function(data) {return data;};
module.exports.invoker = function(method) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(obj) {
        return obj[method].apply(this, args);
    };
}

module.exports.uniq = function(lambda) {
    lambda = lambda || identity;
    var lambdas = {};
    return function(value, index, self) {
        if (index === 0) return true;
        var sl = lambda(value);
        for (var i = index + 1; i < self.length; i++) {
            lambdas[i] = lambdas[i] || lambda(self[i]);
            if (lambdas[i] === sl) {
                return false;
            }
        }
        return true;
    };
};
