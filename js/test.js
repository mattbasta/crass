var p = require('./grammar');
var objects = require('./objects');

var parser = new p.Parser();
parser.yy = objects;
require('fs').readFile('../temp/github2.lines.css', function(err, data) {
    if (err) {
        console.error('error', err);
        return;
    }
    var output = parser.parse(data + '');
    console.log(output.toString().replace(/\}/g, '}\n'));
});
