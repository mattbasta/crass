// import {Node} from './nodes/Node';
import * as objects from './objects';

import {Node} from './nodes/Node';

export function opts(
  opts: Array<string> = process.argv,
  defaults: {[key: string]: string} = {},
): {[key: string]: string | boolean} {
  const out: {[key: string]: string | boolean} = {...defaults};
  let last: string;
  for (let i = 0; i < opts.length; i++) {
    const is_flag = opts[i].substr(0, 1) === '-';
    if (is_flag && last) {
      out[last] = true;
    } else if (!is_flag && last) {
      out[last] = opts[i];
    }
    last = is_flag ? opts[i].replace(/^\-+/, '') : null;
  }
  if (last) out[last] = true;
  return out;
}

export const stringIdentity = (x: {toString: () => string}) => x.toString();

export function joinAll<T>(
  list: Array<T>,
  joiner: string = '',
  mapper: (x: T) => string = stringIdentity,
): string {
  if (!list) return '';
  return list.map(mapper).join(joiner || '');
}
export async function joinAllAsync<T>(
  list: Array<T>,
  joiner: string = '',
  mapper: (x: T) => Promise<string> = async x => x.toString(),
): Promise<string> {
  if (!list) return '';
  return (await Promise.all(list.map(mapper))).join(joiner || '');
}

export function uniq<T>(lambda: (v: T) => string, list: Array<T>): Array<T> {
  const values = {};
  for (let i = 0; i < list.length; i++) {
    values[lambda(list[i])] = i;
  }
  return Object.keys(values).map(key => list[values[key]]);
}

export const isNum = (obj: Node): obj is objects.Number =>
  obj && obj instanceof objects.Number;
export const isPositiveNum = (obj: Node) => isNum(obj) && obj.asNumber() >= 0;

export function indent(value: string, indent: number = 0) {
  if (!value) return '';
  return new Array((indent || 0) + 1).join('  ') + value;
}

export const prettyMap = (indent: number) => async (x: Node) =>
  x.pretty ? x.pretty(indent) : x.toString();

export function func(
  name: string,
  values,
  sep: string | ((idx: number) => string) = ',',
) {
  return new objects.Func(
    name,
    new objects.Expression(
      values.map((v, index) => {
        if (typeof v === 'number') {
          v = new objects.Number(v);
        }
        if (typeof sep === 'function') {
          return [sep(index), v];
        } else {
          return [index ? sep : null, v];
        }
      }),
    ),
  );
}
