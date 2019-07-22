import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('remove overridden keyframe blocks', () => {
  it('should remove blocks that are overridden', async () => {
    assert.equal(
      await optimized(`
        @keyframes foo {
            from{color: red}
            to{color: blue}
        }
        @keyframes foo {
            from{color: blue}
            to{color: red}
        }
      `),
      await optimized(`
        @keyframes foo {
            from{color: blue}
            to{color: red}
        }
      `),
      'Duplicate keyframe should have been removed',
    );
  });
  it('should remove prefixed blocks that are overridden', async () => {
    assert.equal(
      await optimized(`
        @-webkit-keyframes foo {
            from{color: red}
            to{color: blue}
        }
        @-webkit-keyframes foo {
            from{color: blue}
            to{color: red}
        }
      `),
      await optimized(`
        @-webkit-keyframes foo {
            from{color: blue}
            to{color: red}
        }
      `),
      'Duplicate keyframe should have been removed',
    );
  });
  it('should ignore duplicate blocks with different prefixes', async () => {
    const out = await optimized(`
        @-webkit-keyframes foo {
            from{color: red}
            to{color: blue}
        }
        @-o-keyframes foo {
            from{color: blue}
            to{color: red}
        }
    `);
    assert.ok(out.includes('-webkit-'));
    assert.ok(out.includes('-o-'));
  });
  it('should deduplicate blocks with different prefixes', async () => {
    assert.equal(
      await optimized(`
        @-webkit-keyframes foo {
            from{color: red}
            to{color: blue}
        }
        @-o-keyframes foo {
            from{color: red}
            to{color: blue}
        }
        @-webkit-keyframes foo {
            from{color: blue}
            to{color: red}
        }
        @-o-keyframes foo {
            from{color: blue}
            to{color: red}
        }
      `),
      await optimized(`
        @-webkit-keyframes foo {
            from{color: blue}
            to{color: red}
        }
        @-o-keyframes foo {
            from{color: blue}
            to{color: red}
        }
      `),
      'Should have removed the overridden ones',
    );
  });
});
