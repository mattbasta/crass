import * as assert from 'assert';
import {optimize} from '../_helpers';

async function doesNotChange(data: string) {
  assert.equal(
    await optimize(data).then(x => x.pretty()),
    await optimize(data, {o1: true}).then(x => x.pretty()),
  );
}

async function changes(data: string, expected: string) {
  assert.equal(
    await optimize(expected).then(x => x.pretty()),
    await optimize(expected, {o1: true}).then(x => x.pretty()),
  );
}

describe('Ruleset merging', () => {
  it('should happen for adjacent rulesets', async () => {
    await changes(
      'a{font-weight:bold}b{font-weight:bold}',
      'a,b{font-weight:bold}',
    );
  });

  it('should happen for nearby rulesets', async () => {
    await changes(
      'a{font-weight:bold}c{color:red}b{font-weight:bold}',
      'a,b{font-weight:bold}c{color:red}',
    );
  });

  it('should happen for nearby rulesets with nonconflicting IDs', async () => {
    await changes(
      'a{font-weight:bold}#c{color:red}#b{font-weight:bold}',
      'a,#b{font-weight:bold}#c{color:red}',
    );
  });

  it('should happen for nearby rulesets with nonconflicting attribute selectors', async () => {
    await changes(
      'a{font-weight:bold}[data-x=foo]{color:red}[data-x=bar]{font-weight:bold}',
      'a,[data-x=bar]{font-weight:bold}[data-x=foo]{color:red}',
    );
  });

  it('should not happen for rulesets separated by @media', async () => {
    await doesNotChange(
      'a{font-weight:bold}@media screen{c{color:red}}b{font-weight:bold}',
    );
  });

  it('should not happen for rulesets separated by elements that may match the latter element', async () => {
    await doesNotChange(
      'a{font-weight:bold}.this-is-a-class{color:red}b{font-weight:bold}',
    );
  });

  it('should not happen for rulesets separated by elements that may match the latter element by ID', async () => {
    await doesNotChange('a{font-weight:bold}#b{color:red}b{font-weight:bold}');
  });

  it('should not happen for rulesets separated by elements that may match the latter element by attribute', async () => {
    await doesNotChange(
      'a{font-weight:bold}[c=y]{color:red}[b=x]{font-weight:bold}',
    );
    await doesNotChange(
      'a{font-weight:bold}[c]{color:red}[c=foo]{font-weight:bold}',
    );
  });
});
