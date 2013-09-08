var utils = require('./utils');

var optimizeList = module.exports.optimizeList = function(list, kw) {
	return list.map(utils.invoker('optimize', kw)).filter(utils.identity);
};

module.exports.optimizeBlocks = function(content, kw) {
	// TODO: Add reordering/de-duplicating/etc. here
	return optimizeList(content, kw);
}

module.exports.optimizeDeclarations = function(content, kw) {
	// OPT: Sort declarations.
	content = content.sort(function(a, b) {
		return a.ident < b.ident ? -1 : 1;
	});
	// OPT: Remove duplicate declarations.
	content = content.filter(utils.uniq(function(val) {
		return val.ident;
	}));
	// TODO: Add reordering/de-duplicating/etc. here
	return optimizeList(content, kw);
}
