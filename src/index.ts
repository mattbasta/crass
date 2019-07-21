import * as grammar from './grammar';
import * as objects from './objects';

exports.parse = function parse(data: string) {
    const parser = new grammar.Parser();
    parser.lexer.options.ranges = true;
    parser.yy = objects;

    return parser.parse(data + '');
};

exports.objects = objects;
