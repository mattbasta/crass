import {ChainLink} from '../nodes/Expression';

export default (chain: Array<ChainLink>): Array<ChainLink> => {
  if (chain.length === 4) {
    return chain;
  } else if (chain.length === 3) {
    return chain.concat([chain[1]]);
  } else if (chain.length === 2) {
    return chain.concat(chain);
  } else if (chain.length === 1) {
    return chain
      .concat(chain)
      .concat(chain)
      .concat(chain);
  }
  return chain;
};
