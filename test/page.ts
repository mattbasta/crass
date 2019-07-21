import * as assert from 'assert';


var filler = 'x:y';
var parity = function(data, expectation) {
    data = data.replace(/\$\$/g, filler);
    assert.equal(crass.parse(data).toString(), expectation || data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), expectation || data);
}


describe('@page', () => {
    it('should parse pages', () => {
        parity('@page :first{$$}');
        parity('@page :first{$$;}', '@page :first{x:y}');
        parity('@page :first{$$;a:b}');
    });
    it('should parse empty pages', () => {
        parity('@page :first{}');
    });

    it('should parse pages with margins', () => {
        parity('@page :first{$$;@top-right{$$}}');
        parity('@page :first{$$;@top-right{$$}a:b}');
    });

    it('should optimize page declarations', () => {
        assert.equal(
            crass.parse('@page :first {width: 12pt}').optimize().toString(),
            '@page :first{width:1pc}'
        );
    });
    it('should optimize page declarations with margins', () => {
        assert.equal(
            crass.parse('@page :first {@top-right{width:12pt}}').optimize().toString(),
            '@page :first{@top-right{width:1pc}}'
        );
    });
});
