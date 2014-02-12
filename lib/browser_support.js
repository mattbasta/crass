var utils = require('./utils');


exports.BROWSERS = {
    fx: 'firefox',
    chr: 'chrome',
    ie: 'ie',
    op: 'opera'
};

var BrowserMin = exports.BrowserMin = function(browser, version) {
    this.browser = browser;
    this.version = version | 0;
};

exports.parseBrowser = function(str) {
    var matches = /([a-z]+)([0-9]+)/.exec(str);
    return new BrowserMin(exports.BROWSERS[matches[1]], matches[2]);
};


exports.DECLARATIONS_REMOVED = {
    '-moz-border-radius': {firefox: 4},
    '-webkit-border-radius': {chrome: 5},
    '-o-border-radius': {opera: 12},

    '-moz-box-shadow': {firefox: 4},
    '-webkit-box-shadow': {chrome: 10},

    '-moz-transition': {firefox: 16},
    '-moz-transition-delay': {firefox: 16},
    '-moz-transition-duration': {firefox: 16},
    '-moz-transition-property': {firefox: 16},
    '-moz-transition-timing-function': {firefox: 16},
    '-webkit-transition': {chrome: 26},
    '-webkit-transition-delay': {chrome: 26},
    '-webkit-transition-duration': {chrome: 26},
    '-webkit-transition-property': {chrome: 26},
    '-webkit-transition-timing-function': {chrome: 26},
    '-o-transition': {opera: 12},

    '-moz-animation': {firefox: 16},
    '-moz-animation-delay': {firefox: 16},
    '-moz-animation-direction': {firefox: 16},
    '-moz-animation-duration': {firefox: 16},
    '-moz-animation-fill-mode': {firefox: 16},
    '-moz-animation-iteration-count': {firefox: 16},
    '-moz-animation-name': {firefox: 16},
    '-moz-animation-play-state': {firefox: 16},
    '-moz-animation-timing-function': {firefox: 16},
    '-o-animation': {opera: 13},
    '-o-animation-delay': {opera: 13},
    '-o-animation-direction': {opera: 13},
    '-o-animation-duration': {opera: 13},
    '-o-animation-fill-mode': {opera: 13},
    '-o-animation-iteration-count': {opera: 13},
    '-o-animation-name': {opera: 13},
    '-o-animation-play-state': {opera: 13},
    '-o-animation-timing-function': {opera: 13},

    '-ms-filter': {ie: 10},
    'filter': {ie: 10},
    // '-ms-interpolation-mode': {ie: 10}  // Deprecated but not removed?
};

exports.KEYFRAMES_PREFIX_REMOVED = {
    '-webkit-': {chrome: 40},  // TODO: Update this when http://crbug.com/154771 is fixed
    '-moz-': {firefox: 16},
    '-o-': {opera: 13}
};


function match_browser(browserObj, kw) {
    for (var browser in browserObj) {
        if (browser in kw.browser_min && kw.browser_min[browser] >= browserObj[browser]) {
            return false;
        }
    }
    return true;
}

exports.supportsDeclaration = function(declaration, kw) {
    if (!kw.browser_min || !(declaration in exports.DECLARATIONS_REMOVED)) return true;

    return match_browser(exports.DECLARATIONS_REMOVED[declaration], kw);
};

exports.supportsKeyframe = function(prefix, kw) {
    // IE never supported a @-ms-keyframes block.
    if (prefix === '-ms-') return false;

    if (!kw.browser_min || !(prefix in exports.KEYFRAMES_PREFIX_REMOVED)) return true;

    return match_browser(exports.KEYFRAMES_PREFIX_REMOVED[prefix], kw);
};
