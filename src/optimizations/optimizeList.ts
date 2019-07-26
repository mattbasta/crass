import { Node, OptimizeKeywords } from "../nodes/Node";

export default async <T extends Node>(
  list: Array<T>,
  kw: OptimizeKeywords,
): Promise<Array<T>> => {
  const output: Array<T> = [];
  for (let i = 0; i < list.length; i++) {
    const temp = await list[i].optimize(kw);
    if (!temp) continue;
    output.push(temp as T);
  }
  return output;
};
