import { LonghandDeclaration } from "./shorthandMapping";
import * as objects from '../objects';

export default function mergeDeclarations(
  rule: LonghandDeclaration,
  shorthand: objects.Declaration,
  longhand: objects.Declaration,
) {
  if (!rule.declQualifies(longhand)) {
    return null;
  }
  if (
    rule.canMerge &&
    !rule.canMerge(shorthand.expr.chain, longhand.expr.chain)
  ) {
    return null;
  }

  const declIdx = rule.decls.indexOf(longhand.ident);
  const newChain = rule.shorthandMerger(
    shorthand.expr.chain,
    longhand.expr.chain,
    declIdx,
  );

  const output = new objects.Declaration(
    shorthand.ident,
    new objects.Expression(newChain),
  );

  if (shorthand.important) {
    output.important = true;
  }

  return output;
}
