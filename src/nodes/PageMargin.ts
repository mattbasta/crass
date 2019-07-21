import * as optimization from '../optimization';
import * as utils from '../utils';


export default class PageMargin {
    /**
     * @constructor
     * @param {string} margin
     * @param {array} content
     */
    constructor(margin, content) {
        this.margin = margin;
        this.content = content;
    }


    toString() {
        return '@' + this.margin + '{' + utils.joinAll(this.content) + '}';
    }

    /**
     * @param {int} indent
     * @return {string}
     */
    async pretty(indent: number) {
        let output = '';
        output += utils.indent('@' + this.margin + ' {') + '\n';
        output += this.content.map(line => utils.indent(line.pretty(indent + 1) + ';', indent + 1)).join('\n') + '\n';
        output += utils.indent('}', indent) + '\n';
        return output;
    }

    /**
     * @param {object} kw
     * @return {PageMargin}
     */
    async optimize(kw) {
        this.content = optimization.optimizeDeclarations(this.content, kw);
        return this;
    }
};
