import {canSelectorsEverTouchSameElement, isSubset, manySome} from './mergeRulesets';
import * as objects from '../objects';

describe('mergeRulesets', () => {
  describe('canSelectorsEverTouchSameElement', () => {
    it('should handle elements that overlap', () => {
      expect(
        canSelectorsEverTouchSameElement(
          [
            new objects.DescendantSelector(
              new objects.SimpleSelector([new objects.ClassSelector('class')]),
              new objects.SimpleSelector([
                new objects.ElementSelector('element', null),
              ]),
            ),
          ],
          [
            new objects.DescendantSelector(
              new objects.SimpleSelector([
                new objects.AttributeSelector(
                  new objects.Identifier('attr'),
                  null,
                  null,
                ),
              ]),
              new objects.SimpleSelector([
                new objects.ElementSelector('element', null),
              ]),
            ),
          ],
        ),
      ).toBe(true);
    });
    it('should handle IDs that overlap', () => {
      expect(
        canSelectorsEverTouchSameElement(
          [
            new objects.DescendantSelector(
              new objects.SimpleSelector([new objects.ClassSelector('class')]),
              new objects.SimpleSelector([new objects.IDSelector('id')]),
            ),
          ],
          [
            new objects.DescendantSelector(
              new objects.SimpleSelector([
                new objects.AttributeSelector(
                  new objects.Identifier('attr'),
                  null,
                  null,
                ),
              ]),
              new objects.SimpleSelector([new objects.IDSelector('id')]),
            ),
          ],
        ),
      ).toBe(true);
    });
  });

  describe('isSubset', () => {
    it('should handle a full subset', () => {
      expect(isSubset(['a', 'b'], ['a', 'b'])).toBe(true);
    });
    it('should handle a partial subset', () => {
      expect(isSubset(['a'], ['a', 'b'])).toBe(true);
    });
    it('should handle an empty subset', () => {
      expect(isSubset([], ['a', 'b'])).toBe(false);
    });
    it('should return false when there are no overlapping items', () => {
      expect(isSubset(['x', 'y'], ['a', 'b'])).toBe(false);
    });
    it('should return false when the subset is a superset', () => {
      expect(isSubset(['a', 'b', 'c'], ['a', 'b'])).toBe(false);
    });
  });

  describe('manySome', () => {
    it('should return true when at least one combination returns true', () => {
      const a = ['a', 'b', 'c'];
      const b = ['c', 'd', 'e'];
      const c = ['d', 'e', 'f'];
      expect(manySome(a, b, (x, y) => x === y)).toBe(true);
      expect(manySome(a, c, (x, y) => x === y)).toBe(false);
      expect(manySome(b, c, (x, y) => x === y)).toBe(true);
    });
  });
});
