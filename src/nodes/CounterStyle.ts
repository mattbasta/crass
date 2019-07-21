import * as optimization from '../optimization';
import * as utils from '../utils';


export default class CounterStyle {
    /**
     * @constructor
     * @param {string} name
     * @param {array} content
     */
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }

    toString() {
        let output = '@counter-style ' + this.name;
        output += '{';
        output += utils.joinAll(this.content, ';');
        output += '}';
        return output;
    }

    /**
     * @param {int} indent
     * @return {string}
     */
    async pretty(indent: number) {
        let output = '';
        output += utils.indent('@counter-style ' + this.name + ' {') + '\n';
        output += this.content.map(line => utils.indent(line.pretty(indent + 1), indent)).join(';\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    }

    /**
     * @param {object} kw
     * @return {CounterStyle}
     */
    async optimize(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
        if (!this.content.length) {
            return null;
        }
        return this;
    }
};
