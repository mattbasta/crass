var colorConvert = require('color-convert');

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
HexColor.prototype.optimize = function optimize(kw) {
    // OPT: Lowercase hex colors.
    this.color = this.color.toLowerCase();

    this.stripColorAlpha();

    if (this.color.length === 5 || this.color.length === 9) {
        var unalphaed = this.color.substr(1, this.color.length === 5 ? 3 : 6);
        var applier = function(funcName) {
            return colorConvert.hex[funcName](unalphaed);
        }.bind(this);
        var alpha = this.color.length === 5 ? parseInt(this.color.substr(-1), 16) / 15 : parseInt(this.color.substr(-2), 16) / 255;
        return optimization.color(applier, alpha, kw);
    }

    // OPT: Shorten hex colors
    this.color = optimization.shortenHexColor(this.color);
    // OPT: Convert hex -> name when possible.
    if (this.color in colors.HEX_TO_COLOR) {
        return colors.HEX_TO_COLOR[this.color];
    }

    return this;
};

/**
 * @return {void}
 */
HexColor.prototype.stripColorAlpha = function stripColorAlpha() {
    if (this.color.length === 5 && this.color[4] === 'f') {
        this.color = this.color.substr(0, 4);
        return;
    }
    if (this.color.length === 9 && this.color[7] === 'f' && this.color[8] === 'f') {
        this.color = this.color.substr(0, 7);
        return;
    }
};

module.exports = HexColor;
