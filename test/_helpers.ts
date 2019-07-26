import * as crass from '../src';
import {OptimizeKeywords} from '../src/nodes/Node';

export function parse(data: string) {
  return crass.parse(data);
}
export function parsed(data: string) {
  return parse(data).toString();
}
export async function pretty(data: string) {
  return parse(data).pretty();
}

export async function optimize(data: string, kw: OptimizeKeywords = {}) {
  return parse(data).optimize(kw);
}
export async function optimized(data: string, kw: OptimizeKeywords = {}) {
  return (await optimize(data, kw)).toString();
}
export async function optimizedPretty(data: string, kw: OptimizeKeywords = {}) {
  return (await optimize(data, kw)).pretty();
}

export async function parity(data: string, expected?: string) {
  expect(parsed(data)).toBe(expected || data);
  expect(parsed(await pretty(data))).toBe(expected || data);
}
export async function parityOpt(
  data: string,
  expected?: string,
  kw: OptimizeKeywords = {o1: true},
) {
  expect(await optimized(data, kw)).toBe(expected || data);
  expect(parsed(await pretty(data))).toBe(data);
}
export async function parityOptSaveIE(
  data: string,
  expected?: string,
  kw: OptimizeKeywords = {o1: true},
) {
  expect(await optimized(data, {...kw, saveie: true})).toBe(expected || data);
  expect(
    parsed(await (await optimize(data, {...kw, saveie: true})).pretty()),
  ).toBe(data);
}
export async function parityFilled(data: string, filler: string = 'a:b;c:d') {
  return parity(data.replace(/\$\$/g, filler));
}
export async function parityExpFilled(
  data: string,
  expectation: string,
  filler: string = 'a:b;c:d',
) {
  return parity(
    data.replace(/\$\$/g, filler),
    expectation.replace(/\$\$/g, filler),
  );
}
