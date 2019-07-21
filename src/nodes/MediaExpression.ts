import * as optimization from '../optimization';
import { OptimizeKeywords } from './Node';


export default class MediaExpression {
    desciptor: string;

    /**
     * @constructor
     * @param {string} descriptor
     * @param {Expression} value
     * @param {object} ieCrap Flags for IE
     */
    constructor(descriptor, value, ieCrap) {
        this.descriptor = descriptor;
        this.value = value;
        this.ieCrap = ieCrap;
    }

    toString() {
        const descriptor = this.descriptor.toString();
        const slashZero = this.ieCrap.slashZero ? '\\0' : '';
        if (this.value) {
            return '(' + descriptor + ':' + this.value.toString() + slashZero + ')';
        } else {
            return '(' + descriptor + slashZero + ')';
        }
    }

    async pretty(indent: number) {
        const descriptor = this.descriptor.toString();
        const slashZero = this.ieCrap.slashZero ? '\\0' : '';
        if (this.value) {
            return '(' + descriptor + ': ' + this.value.pretty(indent) + slashZero + ')';
        } else {
            return '(' + descriptor + slashZero + ')';
        }
    }

    async optimize(kw: OptimizeKeywords) {
        this.value = await optimization.try_(this.value, kw);
        return this;
    }
};
