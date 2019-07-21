import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('URIs', () => {
  it('should not get all effed up', async () => {
    assert.equal(
      await optimized(
        'a{foo:url("http://mysite.com/images/featured_(for_homepage)/1.jpg")}',
        {o1: true},
      ),
      'a{foo:url("http://mysite.com/images/featured_(for_homepage)/1.jpg")}',
    );
  });

  it('should escape spaces', async () => {
    assert.equal(
      await optimized('a{foo:url("http://mysite.com/images/foo bar.jpg")}', {
        o1: true,
      }),
      'a{foo:url(http://mysite.com/images/foo\\ bar.jpg)}',
    );
  });

  it('should trim URLs', async () => {
    assert.equal(
      await optimized('a{foo:url("    foo.jpg")}', {o1: true}),
      'a{foo:url(foo.jpg)}',
    );
    assert.equal(
      await optimized('a{foo:url("    fo o.jpg")}', {o1: true}),
      'a{foo:url(fo\\ o.jpg)}',
    );
  });

  it('should handle URL path separator (RFC 3986)', async () => {
    assert.equal(
      await optimized(
        'a{foo:url(http://mysite.com/images\\foo//bar\\baz/asdf.jpg)}',
        {o1: true},
      ),
      'a{foo:url(http://mysite.com/images/foo/bar/baz/asdf.jpg)}',
    );
  });
});
