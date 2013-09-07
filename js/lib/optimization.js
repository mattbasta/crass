var utils = require('./utils');

var optimizeList = module.exports.optimizeList = function(list, kw) {
	return list.map(utils.invoker('optimize', kw)).filter(utils.identity);
};

module.exports.optimizeBlocks = function(content, kw) {
	// TODO: Add reordering/de-duplicating/etc. here
	return optimizeBlocks(content, kw);
}
