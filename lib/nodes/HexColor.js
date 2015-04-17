var colors = require('../colors');
var optimization = require('../optimization');


/**
 * @constructor
 * @param {string} color
 */
function HexColor(color) {
    this.color = color;
}


/**
 * @return {string}
 */
HexColor.prototype.toString = function toString() {
    return this.color;
};

/**
 * @return {string}
 */
HexColor.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {HexColor}
 */
HexColor.prototype.optimize = function optimize() {
    // OPT: Lowercase hex colors.
    this.color = this.color.toLowerCase();
    // OPT: Shorten hex colors
    this.color = optimization.shortenHexColor(this.color);
    // OPT: Convert hex -> name when possible.
    if (this.color in colors.HEX_TO_COLOR) {
        return colors.HEX_TO_COLOR[this.color];
    }

    return this;
};

module.exports = HexColor;
