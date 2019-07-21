export default class CustomIdent {
    /**
     * @constructor
     * @param {string[]} color
     */
    constructor(idents) {
        this.idents = idents;
    }

    toString() {
        return '[' + this.idents.join(' ') + ']';
    }

    pretty() {
        return this.toString();
    }

    /**
     * @return {CustomIdent}
     */
    optimize() {
        return this;
    }
};
