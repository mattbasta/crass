import * as grammar from './grammar';
import * as objects from './objects';

export function parse(data: string) {
  const parser = new grammar.Parser();
  parser.lexer.options.ranges = true;
  parser.yy = objects;

  return parser.parse(data + '');
}

export {objects};
