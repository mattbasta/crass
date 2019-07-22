import * as assert from 'assert';

import {parity} from '../_helpers';

describe('media block optimizer', () => {
  it('should combine adjacent media blocks', async () => {
    await parity(
      '@media(max-width: 123){foo{a:b}}@media(max-width: 123){bar{c:d}}',
      '@media(max-width:123){foo{a:b}bar{c:d}}',
    );
  });
  it('should optimize after combining media blocks', async () => {
    await parity(
      '@media(max-width: 123){foo{a:b}}@media(max-width: 123){bar{a:b}}',
      '@media(max-width:123){bar,foo{a:b}}',
    );
  });
});
