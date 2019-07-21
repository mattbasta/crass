import * as objects from '../objects';
import * as optimization from '../optimization';
import { Selector } from './Node';


export default class NthSelector implements Selector {
    funcName: string;
    linearFunc: objects.LinearFunction;

    constructor(funcName: string, linearFunc: objects.LinearFunction) {
        this.funcName = funcName;
        this.linearFunc = linearFunc;
    }

    toString() {
        return ':' + this.funcName + '(' + this.linearFunc.toString() + ')';
    }

    async pretty(indent: number) {
        const lfPretty = await this.linearFunc.pretty(indent);
        return ':' + this.funcName + '(' + lfPretty + ')';
    }

    /**
     * @param {object} kw
     * @return {NthSelector}
     */
    async optimize(kw) {
        this.linearFunc = optimization.try_(this.linearFunc, kw);

        // OPT: nth-selectors (2n+1) to (odd)
        if (this.linearFunc.toString() === '2n+1') {
            return new objects.NthSelector(this.funcName, 'odd');
        }

        return this;
    }
};
