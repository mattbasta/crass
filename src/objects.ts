import { Node } from "./nodes/Node";

export { default as AdjacentSelector } from "./nodes/AdjacentSelector";
export { default as AttributeSelector } from "./nodes/AttributeSelector";
export { default as Charset } from "./nodes/Charset";
export { default as ClassSelector } from "./nodes/ClassSelector";
export { default as CounterStyle } from "./nodes/CounterStyle";
export { default as CustomIdent } from "./nodes/CustomIdent";
export { default as Declaration } from "./nodes/Declaration";
export { default as DescendantSelector } from "./nodes/DescendantSelector";
export { default as Dimension } from "./nodes/Dimension";
export {
  default as DirectDescendantSelector
} from "./nodes/DirectDescendantSelector";
export { default as ElementSelector } from "./nodes/ElementSelector";
export { default as Expression } from "./nodes/Expression";
export { default as FontFace } from "./nodes/FontFace";
export { default as FontFeatureValues } from "./nodes/FontFeatureValues";
export {
  default as FontFeatureValuesBlock
} from "./nodes/FontFeatureValuesBlock";
export { default as Func } from "./nodes/Func";
export { default as HexColor } from "./nodes/HexColor";
export { default as IDSelector } from "./nodes/IDSelector";
export { default as IEFilter } from "./nodes/IEFilter";
export { default as Import } from "./nodes/Import";
export { default as Keyframe } from "./nodes/Keyframe";
export { default as Keyframes } from "./nodes/Keyframes";
export { default as KeyframeSelector } from "./nodes/KeyframeSelector";
export { default as LinearFunction } from "./nodes/LinearFunction";
export { default as MathProduct } from "./nodes/MathProduct";
export { default as MathSum } from "./nodes/MathSum";
export { default as Media } from "./nodes/Media";
export { default as MediaExpression } from "./nodes/MediaExpression";
export { default as MediaQuery } from "./nodes/MediaQuery";
export { default as Namespace } from "./nodes/Namespace";
export { default as NotSelector } from "./nodes/NotSelector";
export { default as NthSelector } from "./nodes/NthSelector";
export { default as Number } from "./nodes/Number";
export { default as NValue } from "./nodes/NValue";
export { default as Page } from "./nodes/Page";
export { default as PageMargin } from "./nodes/PageMargin";
export { default as PseudoClassSelector } from "./nodes/PseudoClassSelector";
export {
  default as PseudoElementSelector
} from "./nodes/PseudoElementSelector";
export {
  default as PseudoSelectorFunction
} from "./nodes/PseudoSelectorFunction";
export { default as Ruleset } from "./nodes/Ruleset";
export { default as SelectorList } from "./nodes/SelectorList";
export { default as SiblingSelector } from "./nodes/SiblingSelector";
export { default as SimpleSelector } from "./nodes/SimpleSelector";
export { default as String } from "./nodes/String";
export { default as Stylesheet } from "./nodes/Stylesheet";
export { default as Supports } from "./nodes/Supports";
export {
  default as SupportsConditionList
} from "./nodes/SupportsConditionList";
export { default as SupportsCondition } from "./nodes/SupportsCondition";
export { default as URI } from "./nodes/URI";
export { default as Viewport } from "./nodes/Viewport";

export function createSelectorList(base: Node, addon) {
  if (base instanceof exports.SelectorList) {
    base.push(addon);
    return base;
  } else {
    return new exports.SelectorList([base, addon]);
  }
}

export function createSupportsConditionList(addition, combinator, base: Node) {
  if (
    base instanceof exports.SupportsConditionList &&
    base.combinator === combinator
  ) {
    base.unshift(addition);
    return base;
  } else {
    return new exports.SupportsConditionList(combinator, [addition, base]);
  }
}
