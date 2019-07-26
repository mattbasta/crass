import {Node, OptimizeKeywords} from '../nodes/Node';

export default async <T extends Node>(obj: T | null, kw: OptimizeKeywords) => {
  if (!obj) return obj;
  if (obj.optimize) return obj.optimize(kw);
  return obj;
};
