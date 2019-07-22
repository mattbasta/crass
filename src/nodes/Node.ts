export type OptimizeKeywords = {
  browser_min?: {[browser: string]: number};
  css4?: boolean;
  declarationName?: string;
  func?: string;
  insideKeyframes?: string;
  keyframeMap?: {[vendorPrefix: string]: {[keyframeName: string]: Node}};
  o1?: boolean;
  saveie?: boolean;
  vendorPrefix?: string;
};

export interface Node {
  toString(): string;
  pretty(indent: number): Promise<string>;
  optimize(kw: OptimizeKeywords): Promise<Node | null>;
}

export interface Expression extends Node {}
export interface StringableExpression extends Expression {
  asString(): StringableExpression;
  asRawString(escaped?: boolean): string;
}
export interface NumberableExpression extends Expression {
  asNumber(): number;
  asUnsigned(): NumberableExpression;
}

export interface Block<Contents = Node> extends Node {
  content: Array<Contents>;

  getBlockHeader(): string;
}

export interface Selector extends Node {}
