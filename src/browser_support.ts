import {OptimizeKeywords} from './nodes/Node';

export type BrowserSupport = Record<string, number>;

export const BROWSERS: Record<string, string> = {
  fx: 'firefox',
  chr: 'chrome',
  ie: 'ie',
  op: 'opera',
};

export class BrowserMin {
  browser: string;
  version: number;
  constructor(browser: string, version: number) {
    this.browser = browser;
    this.version = version | 0;
  }
}

export function parseBrowser(str: string): BrowserMin {
  const matches = /([a-z]+)([0-9]+)/.exec(str);
  if (!matches) {
    throw new Error(`Error parsing browser string "${str}"`);
  }
  return new BrowserMin(BROWSERS[matches[1]], Number(matches[2]));
}

const NOBODY = {ie: 0, chrome: 0, firefox: 0, opera: 0};
export const DECLARATIONS_REMOVED: Record<string, BrowserSupport> = {
  '-moz-border-radius': {firefox: 4},
  '-webkit-border-radius': {chrome: 5},
  '-o-border-radius': {opera: 12},

  '-moz-box-shadow': {firefox: 4},
  '-webkit-box-shadow': {chrome: 10},

  '-moz-box-sizing': {firefox: 29},
  '-webkit-box-sizing': {chrome: 9},

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
  '-webkit-animation': {chrome: 43},
  '-webkit-animation-delay': {chrome: 43},
  '-webkit-animation-direction': {chrome: 43},
  '-webkit-animation-duration': {chrome: 43},
  '-webkit-animation-fill-mode': {chrome: 43},
  '-webkit-animation-iteration-count': {chrome: 43},
  '-webkit-animation-name': {chrome: 43},
  '-webkit-animation-play-state': {chrome: 43},
  '-webkit-animation-timing-function': {chrome: 43},

  '-moz-align-content': {firefox: 28},
  '-moz-align-items': {firefox: 20},
  '-moz-align-self': {firefox: 20},
  '-moz-flex': {firefox: 20},
  '-moz-flex-basis': {firefox: 22},
  '-moz-flex-direction': {firefox: 20},
  '-moz-flex-flow': {firefox: 28},
  '-moz-flex-grow': {firefox: 20},
  '-moz-flex-shrink': {firefox: 20},
  '-moz-flex-wrap': {firefox: 28},
  '-moz-justify-content': {firefox: 20},
  '-webkit-align-content': {chrome: 29},
  '-webkit-align-items': {chrome: 29},
  '-webkit-align-self': {chrome: 29},
  '-webkit-flex': {chrome: 29},
  '-webkit-flex-basis': {chrome: 29},
  '-webkit-flex-direction': {chrome: 29},
  '-webkit-flex-flow': {chrome: 29},
  '-webkit-flex-grow': {chrome: 29},
  '-webkit-flex-shrink': {chrome: 29},
  '-webkit-flex-wrap': {chrome: 29},
  '-webkit-justify-content': {chrome: 29},
  '-ms-align-items': {ie: 11},
  '-ms-align-content': {ie: 11},
  '-ms-align-self': {ie: 11},
  '-ms-flex': {ie: 11},
  '-ms-flex-basis': {ie: 11},
  '-ms-flex-direction': {ie: 11},
  '-ms-flex-flow': {ie: 11},
  '-ms-flex-grow': {ie: 11},
  '-ms-flex-shrink': {ie: 11},
  '-ms-flex-order': {ie: 11},
  '-ms-flex-wrap': {ie: 11},
  '-ms-justify-content': {ie: 11},
  '-ms-order': {ie: 11},

  '-moz-transform': {firefox: 16},
  '-moz-transform-origin': {firefox: 16},
  '-moz-transform-style': {firefox: 16},
  '-moz-backface-visibility': {firefox: 16},
  '-moz-perspective': {firefox: 16},
  '-moz-perspective-origin': {firefox: 16},

  '-ms-filter': {ie: 10},
  // '-ms-interpolation-mode': {ie: 10}  // Deprecated but not removed?

  // Invalid declarations that folks generate:
  '-ms-transform': {ie: 0}, // IE never had a prefixed set of transform declarations.
  '-ms-transform-origin': {ie: 0},
  'box-align': NOBODY, // Nobody ever implemented an un-prefixed box declarations (now obsolete).
  'box-flex': NOBODY,
  'box-ordinal-group': NOBODY,
  'box-orient': NOBODY,
  'box-pack': NOBODY,

  '-moz-hyphens': {firefox: 43},
  '-moz-math-display': {firefox: 44},
  '-moz-text-decoration-color': {firefox: 40},
  '-moz-text-decoration-line': {firefox: 40},
  '-moz-text-decoration-style': {firefox: 40},
  '-moz-text-align-last': {firefox: 49},
  '-moz-window-shadow': {firefox: 44},
};

export const KEYFRAMES_PREFIX_REMOVED: Record<string, BrowserSupport> = {
  '-webkit-': {chrome: 43},
  '-moz-': {firefox: 16},
  '-o-': {opera: 13},
};

function match_browser(
  browserObj: BrowserSupport,
  kw: OptimizeKeywords,
): boolean {
  const supportedBrowsers = Object.keys(browserObj).filter(
    key => key in (kw.browser_min || {}),
  );
  if (!supportedBrowsers.length) {
    return true;
  }
  return supportedBrowsers.some(
    key => (kw.browser_min || {})[key] < browserObj[key],
  );
}

export function supportsDeclaration(
  declaration: string,
  kw: OptimizeKeywords,
): boolean {
  if (!kw.browser_min) return true;

  // OPT: Drop `_foo: bar` in browsers newer than IE6.
  if (
    declaration[0] === '_' &&
    kw.browser_min.ie &&
    kw.browser_min.ie > 6 &&
    !kw.saveie
  ) {
    return false;
  }

  if (!kw.browser_min || !(declaration in DECLARATIONS_REMOVED)) return true;

  return match_browser(DECLARATIONS_REMOVED[declaration], kw);
}

export function supportsKeyframe(
  prefix: string,
  kw: OptimizeKeywords,
): boolean {
  // IE never supported a @-ms-keyframes block.
  if (prefix === '-ms-') return false;

  if (!kw.browser_min || !(prefix in KEYFRAMES_PREFIX_REMOVED)) return true;

  return match_browser(KEYFRAMES_PREFIX_REMOVED[prefix], kw);
}
