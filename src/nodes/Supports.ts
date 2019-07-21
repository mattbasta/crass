import {Block, OptimizeKeywords} from './Node';
import * as objects from '../objects';
import SupportsConditionList from './SupportsConditionList';

import * as optimization from '../optimization';
import * as utils from '../utils';

export default class Supports implements Block {
  conditionList: SupportsConditionList | objects.SupportsCondition;
  content: Array<Block>;

  constructor(conditionList: SupportsConditionList, content: Array<Block>) {
    this.conditionList = conditionList;
    this.content = content;
  }

  getBlockHeader() {
    return '@supports ';
  }

  toString() {
    let output = '@supports ';
    output += this.conditionList.toString();
    output += '{' + utils.joinAll(this.content) + '}';
    return output;
  }

  async pretty(indent: number) {
    const conditionList = await this.conditionList.pretty(indent);
    let output =
      utils.indent('@supports ' + conditionList + ' {', indent) + '\n';
    output += (await Promise.all(
      this.content.map(async line =>
        utils.indent(await line.pretty(indent + 1), indent),
      ),
    )).join('\n');
    output += utils.indent('}', indent) + '\n';
    return output;
  }

  async optimize(kw: OptimizeKeywords) {
    this.conditionList = (await this.conditionList.optimize(
      kw,
    )) as Supports['conditionList'];
    this.content = optimization.optimizeBlocks(this.content, kw);
    return this;
  }
}
