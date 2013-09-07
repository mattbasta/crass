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

module.exports.identity = function(data) {return data;};
module.exports.invoker = function(method) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(obj) {
        return obj[method].apply(this, args);
    };
}
