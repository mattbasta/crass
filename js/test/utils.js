var assert = require("assert");

var utils = require('../lib/utils');

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
