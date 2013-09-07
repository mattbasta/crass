var p = require('./grammar');
var objects = require('./objects');

var parser = new p.Parser();
parser.yy = objects;
require('fs').readFile('../temp/github2.css', function(err, data) {
	if (err) {
		console.error('error', err);
		return;
	}
	var output = parser.parse(data + '');
	console.log(output);
	console.log(output.toString());
});
