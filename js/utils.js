
module.exports.joinAll = function(list, joiner) {
    return list.map(function(i) {return i.toString();}).join(joiner || '');
};

