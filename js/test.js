var p = require('./grammar');
var objects = require('./objects');

var parser = new p.Parser();
parser.yy = objects;
var output = parser.parse('foo {bar: zip zap 123em;}');
console.log(output);

