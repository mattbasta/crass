/**
 * @constructor
 * @param {string} stop
 */
function KeyframeSelector(stop) {
    this.stop = stop;
}

/**
 * @return {string}
 */
KeyframeSelector.prototype.toString = function toString() {
    return this.stop;
};

/**
 * @return {string}
 */
KeyframeSelector.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {KeyframeSelector}
 */
KeyframeSelector.prototype.optimize = function optimize() {
    // OPT: Convert 'from' to 0%
    if (this.stop === 'from') {
        this.stop = '0%';
    } else if (this.stop === '100%') {
        this.stop = 'to';
    }
    return this;
};


module.exports = KeyframeSelector;
