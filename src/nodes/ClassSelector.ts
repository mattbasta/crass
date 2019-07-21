export default class ClassSelector {
    /**
     * @constructor
     * @param {string} ident
     */
    constructor(ident) {
        this.ident = ident;
    }

    toString() {
        return '.' + this.ident;
    }

    pretty() {
        return this.toString();
    }

    /**
     * @return {ClassSelector}
     */
    optimize() {
        return this;
    }
};
