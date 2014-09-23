var objects = require('./lib/objects');

module.exports.parse = function(data) {
    var p = require('./grammar');
    var parser = new p.Parser();
    parser.lexer.options.ranges = true;
    parser.yy = objects;

    return parser.parse(data + '');
};

module.exports.objects = objects;
