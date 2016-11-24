var assert = require('assert');

var objects = require('../lib/objects');
var utils = require('../lib/utils');


describe('opts', function() {
    it('should default to process.argv', function() {
        assert.equal(
            JSON.stringify(utils.opts()),
            JSON.stringify(utils.opts(process.argv))
        );
    });
    it('should accept a list of arguments', function() {
        var out = utils.opts(['--foo', 'bar', '-f', 'b']);
        assert.equal(out.foo, 'bar');
        assert.equal(out.f, 'b');
    });
    it('should accept flags', function() {
        var out = utils.opts(['--hello', '--foo', 'bar', '-f', 'b']);
        assert.equal(out.hello, true);
    });
    it('should accept flags at the end', function() {
        var out = utils.opts(['--foo', 'bar', '-f', 'b', '--hello']);
        assert.equal(out.hello, true);
    });
});

describe('joinAll', function() {
    it('should return empty string if there is no list', function() {
        assert.equal(
            utils.joinAll(),
            ''
        );
    });
    it('should return each of the items joined together', function() {
        assert.equal(
            utils.joinAll([1, 2, 3, true]),
            '123true'
        );
    });
    it('should accept a delimiter', function() {
        assert.equal(
            utils.joinAll([1, 2, 3, true], ' '),
            '1 2 3 true'
        );
    });
    it('should accept a mapper', function() {
        assert.equal(
            utils.joinAll([1, 2, 3, true], ' ', function(x) {
                return x.toString()[0];
            }),
            '1 2 3 t'
        );
    });
});

describe('uniq', function() {
    it('should remove duplicate entries', function() {
        assert.deepEqual(
            utils.uniq(null, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]),
            [1, 2, 3, 4]
        );
    });
    it('should remove duplicate entries with a custom lambda', function() {
        function lambda(x) {
            return x[1];
        }
        assert.deepEqual(
            utils.uniq(lambda, [
                [1, 1],
                [1, 2],
                [2, 3],
                [2, 4],
                [2, 4],
                [3, 4],
                [4, 4]
            ]),
            [
                [1, 1],
                [1, 2],
                [2, 3],
                [4, 4]
            ]
        );
    });
});

describe('indent', function() {
    it('should return empty string if no input is given', function() {
        assert.equal(
            utils.indent('', 4),
            ''
        );
    });
    it('should return an indented string', function() {
        assert.equal(
            utils.indent('foo', 4),
            '        foo'
        );
    });
});

describe('prettyMap', function() {
    it('should return the output of `pretty`', function() {
        assert.equal(
            utils.prettyMap(123)({
                pretty: function(x) {
                    assert.equal(x, 123);
                    return 'pretty indeed';
                }
            }),
            'pretty indeed'
        );
    });
    it('should return the output of `toString` if `pretty` is undefined', function() {
        assert.equal(
            utils.prettyMap(123)({
                toString: function() {
                    return 'not pretty';
                }
            }),
            'not pretty'
        );
    });
});
