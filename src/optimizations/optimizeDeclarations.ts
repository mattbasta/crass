import * as objects from '../objects';
import { OptimizeKeywords } from '../nodes/Node';
import optimizeList from './optimizeList';
import { overrideList } from './overrideList';
import { shorthandMappingMapped, shorthandMapping } from './shorthandMapping';
import mergeDeclarations from './mergeDeclarations';

export default async (
  content: Array<objects.Declaration>,
  kw: OptimizeKeywords,
): Promise<Array<objects.Declaration>> => {
  content = (await optimizeList(content, kw)) as Array<objects.Declaration>;
  if (!content.length) {
    return [];
  }

  // OPT: Remove longhand declarations that are overridden by shorthand declarations
  const seenDeclarations: {[identifier: string]: objects.Declaration} = {};
  for (let i = content.length - 1; i >= 0; i--) {
    let decl: objects.Declaration | null = content[i];
    if (decl.ident in seenDeclarations) {
      const seen = seenDeclarations[decl.ident];
      if (decl.important && !seen.important) {
        content.splice(content.indexOf(seen), 1);
        seenDeclarations[decl.ident] = decl;
      } else {
        content.splice(i, 1);
      }
      continue;
    }

    // If we match an overridable declaration and we've seen one of the
    // things that overrides it, remove it from the ruleset.
    if (
      decl &&
      decl.ident in overrideList &&
      overrideList[decl.ident].some(
        ident =>
          ident in seenDeclarations &&
          seenDeclarations[ident].important >= decl!.important,
      )
    ) {
      content.splice(i, 1);
      continue;
    }

    if (decl && decl.ident in shorthandMappingMapped) {
      shorthand: for (const shorthand of shorthandMappingMapped[decl!.ident]) {
        // Short circuit if we eliminate this declaration below.
        if (!decl) {
          break;
        }
        let seenAny = false;
        for (let lhDecl of shorthand.decls) {
          const seen = seenDeclarations[lhDecl];
          if (!seen) {
            continue;
          }

          if (seen.important && !decl.important) {
            continue;
          } else if (decl.important && !seen.important) {
            // Remove longhand overridden by important shorthand
            content.splice(content.indexOf(seen), 1);
            delete seenDeclarations[lhDecl];
            continue;
          }

          seenAny = true;
        }
        if (!seenAny) {
          break shorthand;
        }
        for (const lhDeclName of shorthand.decls) {
          // Short circuit if we eliminate this declaration below.
          if (!decl) {
            break;
          }

          const lhDecl = seenDeclarations[lhDeclName];
          if (!lhDecl) {
            break;
          }

          if (lhDecl.important && !decl.important) {
            break;
          }

          const output = mergeDeclarations(shorthand, decl, lhDecl);
          // A null result means they could not be merged.
          if (!output) {
            break;
          }

          content.splice(content.indexOf(lhDecl), 1);
          delete seenDeclarations[lhDecl.ident];

          const optimized = await output.optimize(kw);
          if (!optimized) {
            content.splice(i, 1);
            decl = null;
            break;
          }
          decl = optimized;
          content[i] = decl;
          seenDeclarations[decl.ident] = decl;
        }
      }
      if (!decl) {
        continue;
      }
    }

    seenDeclarations[decl.ident] = decl;
  }

  // OPT: Merge together 'piecemeal' declarations when all pieces are specified
  // Ex. padding-left, padding-right, padding-top, padding-bottom -> padding
  shorthand: for (const shMap of shorthandMapping) {
    const subRules = [];
    for (let rule of shMap.decls) {
      const seen = seenDeclarations[rule];
      if (!seen || !shMap.declQualifies(seen)) {
        break shorthand;
      }

      subRules.push(seen);
    }
    if (shMap.allDeclsQualify && !shMap.allDeclsQualify(subRules)) {
      break;
    }

    // Remove the declarations that will be merged
    for (let decl of subRules) {
      content.splice(content.indexOf(decl), 1);
      delete seenDeclarations[decl.ident];
    }

    const mergedRule = new objects.Declaration(
      shMap.name,
      new objects.Expression(shMap.expressionBuilder(subRules)),
    );
    const optimized = await mergedRule.optimize(kw);
    if (optimized) {
      content.push(optimized);
      seenDeclarations[shMap.name] = optimized;
    }
  }

  // TODO: Under O1, do these sorts of reductions:
  /*
        border-color: red;
        border-style: solid;
        border-width: 0 0 4px;
    into
        border: 0 solid red;
        border-bottom-width: 4px;
    or
        border: 0 solid red;
        border-width: 0 0 4px;
    */

  // OPT: Sort declarations.
  return content.sort((a, b) => {
    if (a.ident === b.ident) {
      return a.toString().localeCompare(b.toString());
    }
    return a.ident.localeCompare(b.ident);
  });
};
