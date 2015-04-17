var assert = require("assert");

var crass = require('../crass');

var filler = 'src:"";foo:bar';
var parity = function(data) {
	data = data.replace(/\$\$/g, filler);
	assert.equal(crass.parse(data).toString(), data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), data);
}


describe('@font-face', function() {

    it('should parse font-face blocks', function() {
        parity('@font-face{$$}');
    });

    it('should optimize', function() {
        assert.equal(
            crass.parse('@font-face{font-weight:bold}').optimize().toString(),
            '@font-face{font-weight:700}'
        );
    });

    describe('support for unicode-range in @font-face blocks', function() {
        it('should parse basic unicode code points', function() {
            parity('@font-face{$$;unicode-range:U+123}');
        });
        it('should parse wildcard unicode ranges', function() {
            parity('@font-face{$$;unicode-range:U+1??}');
        });
        it('should parse unicode ranges', function() {
            parity('@font-face{$$;unicode-range:U+123-fFFf}');
        });
    });

});

describe('@font-feature-values', function() {

    it('should parse each of the inner blocks', function() {
        parity('@font-feature-values my font{@swash{$$}}');
        parity('@font-feature-values my font{@annotation{$$}}');
        parity('@font-feature-values my font{@ornaments{$$}}');
        parity('@font-feature-values my font{@stylistic{$$}}');
        parity('@font-feature-values my font{@styleset{$$}}');
        parity('@font-feature-values my font{@character-variant{$$}}');
    });

    it('should parse multiple inner blocks', function() {
        parity('@font-feature-values my font{@annotation{$$}@swash{$$}}');
    });

    it('should parse FFVs with no inner blocks', function() {
        parity('@font-feature-values my font{}');
    });

});
