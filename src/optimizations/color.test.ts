import { shortenHexColor } from "./color";

describe('shortenHexColor', () => {
  it('should shorten colors', () => {
    expect(shortenHexColor('#000000')).toBe('#000');
    expect(shortenHexColor('#001122')).toBe('#012');
    expect(shortenHexColor('#010101')).toBe('#010101');
  });
});
