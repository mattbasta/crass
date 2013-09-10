var assert = require("assert");

var utils = require('../lib/utils');


describe('all', function() {
    it('should only accept all truthy values', function() {
        assert.ok(utils.all([1, 2, -1, true, {}, []]));
        assert.ok(!utils.all([0, 1, 2, -1, true, {}, []]));
    });
    it('should allow a test', function() {
        assert.ok(utils.all([0, false, null, undefined], function(x) {
            return !x;
        }));
    });
    it('should pass on an empty list', function() {
        assert.ok(utils.all([]));
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
