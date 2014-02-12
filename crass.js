var utils = require('./lib/utils');

module.exports.parse = function(data) {
    var p = require('./grammar');
    var parser = new p.Parser();
    parser.yy = require('./lib/objects');

    return parser.parse(data + '');
};
