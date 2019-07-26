import MathSum from './MathSum';
import Dimension from './Dimension';
import Number from './Number';

describe('MathSum', () => {
  describe('toStringWithFlippedSign', () => {
    it('should flip the bit', () => {
      const m = new MathSum(
        new Dimension(new Number(5), 'px'),
        '+',
        new Dimension(new Number(5), 'em'),
      );
      expect(m.toString()).toBe('5px + 5em');
      expect(m.toStringWithFlippedSign()).toBe('5px - 5em');
    });
    it('should flip the bit in reverse', () => {
      const m = new MathSum(
        new Dimension(new Number(5), 'px'),
        '-',
        new Dimension(new Number(5), 'em'),
      );
      expect(m.toString()).toBe('5px - 5em');
      expect(m.toStringWithFlippedSign()).toBe('5px + 5em');
    });
    it('should flip the bit on nested MathSums', () => {
      const m = new MathSum(
        new Dimension(new Number(5), 'px'),
        '+',
        new MathSum(new Dimension(new Number(4), 'em'), '-', new Dimension(new Number(3), 'px')),
      );
      expect(m.toString()).toBe('5px + 4em - 3px');
      expect(m.toStringWithFlippedSign()).toBe('5px - 4em + 3px');
    });
    it('should flip the bit in reverse on nested MathSums', () => {
      const m = new MathSum(
        new Dimension(new Number(5), 'px'),
        '-',
        new MathSum(
          new Dimension(new Number(4), 'em'),
          '+',
          new Dimension(new Number(3), 'px'),
        ),
      );
      expect(m.toString()).toBe('5px - 4em + 3px');
      expect(m.toStringWithFlippedSign()).toBe('5px + 4em - 3px');
    });
  });
});
