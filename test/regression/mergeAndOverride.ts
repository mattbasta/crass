import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('merge and override', () => {
  it('should not override with !important', async () => {
    assert.equal(
      await optimized(
        `
            a {
                padding-bottom: bottom !important;
                padding: 0 1 2 3;
            }
        `,
        {o1: true},
      ),
      'a{padding:0 1 2 3;padding-bottom:bottom!important}',
    );
    assert.equal(
      await optimized(
        `
            a {
                padding: 0 1 2 3;
                padding-bottom: bottom !important;
            }
            `,
        {o1: true},
      ),
      'a{padding:0 1 2 3;padding-bottom:bottom!important}',
    );
    assert.equal(
      await optimized(
        `
            a {
                padding: 0 1 2 3;
            }
            a {
                padding-bottom: bottom !important;
            }
            `,
        {o1: true},
      ),
      'a{padding:0 1 2 3;padding-bottom:bottom!important}',
    );
  });

  it('should override correctly', async () => {
    assert.equal(
      await optimized(
        `
            a {
                padding: 0 1 2 3;
                padding-bottom: bottom;
            }
            `,
        {o1: true},
      ),
      'a{padding:0 1 bottom 3}',
    );
  });

  it('should merge correctly', async () => {
    assert.equal(
      await optimized(
        `
            a {
                padding: 0 1 2 3;
            }
            a {
                padding-bottom: bottom;
            }
            `,
        {o1: true},
      ),
      'a{padding:0 1 bottom 3}',
    );
  });

  it('should not merge into an important shorthand', async () => {
    assert.equal(
      await optimized(
        `
            .box {
                margin: 0 !important;
            }
            .box {
                margin: 1px;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0!important}',
    );
    assert.equal(
      await optimized(
        `
            .box {
                margin: 0 !important;
                margin-top: 1px;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0!important}',
    );
    assert.equal(
      await optimized(
        `
            .box {
                margin-top: 1px;
                margin: 0 !important;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0!important}',
    );
  });

  it('should not merge important longhand into unimportant shorthand', async () => {
    assert.equal(
      await optimized(
        `
            .box {
                margin: 0;
                margin-top: 1px !important;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0;margin-top:1px!important}',
    );
    assert.equal(
      await optimized(
        `
            .box {
                margin-top: 1px !important;
                margin: 0;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0;margin-top:1px!important}',
    );
  });

  it('should perform partial merges into an important shorthand', async () => {
    assert.equal(
      await optimized(
        `
            .box {
                margin: 0 !important;
                margin-left: 2px !important;
                margin-top: 1px;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0 0 0 2px!important}',
    );
    assert.equal(
      await optimized(
        `
            .box {
                margin-top: 1px;
                margin-left: 2px !important;
                margin: 0 !important;
            }
            `,
        {o1: true},
      ),
      '.box{margin:0!important}', // margin-left is overriden by the shorthand "naturally"
    );
  });

  it('should not do distant merges without preserving !important', async () => {
    assert.equal(
      await optimized(
        `
            a { left: 0 !important; }
            div { color: red; }
            a { left: 1px; }
            `,
        {o1: true},
      ),
      'a{left:0!important}div{color:red}a{left:1px}',
    );
  });
});
