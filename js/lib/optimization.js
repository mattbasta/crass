var utils = require('./utils');


module.exports.quadLists = {
    'border-color': 1,
    'border-radius': 1,
    'border-style': 1,
    'border-width': 1,
    'margin': 1,
    'padding': 1
};

module.exports.noneables = {
    'border': 1,
    'border-top': 1,
    'border-right': 1,
    'border-bottom': 1,
    'border-left': 1,
    'outline': 1,
    'background': 1,
};


var optimizeList = module.exports.optimizeList = function(list, kw) {
    if (!list) return list;
    return list.map(utils.invoker('optimize', kw)).filter(utils.identity);
};

module.exports.optimizeBlocks = function(content, kw) {
    // TODO: Add reordering/de-duplicating/etc. here
    return optimizeList(content, kw);
}

module.exports.optimizeDeclarations = function(content, kw) {
    if (!content) return content;
    // OPT: Remove duplicate declarations.
    content = utils.uniq(function(val) {
        return val.ident;
    }, content);
    // OPT: Sort declarations.
    content = content.sort(function(a, b) {
        return a.ident < b.ident ? -1 : 1;
    });
    // TODO: Add reordering/de-duplicating/etc. here
    return optimizeList(content, kw);
}

module.exports.try_ = function(obj, kw) {
    if (!obj) return obj;
    if (obj.optimize) return obj.optimize(kw);
    return obj;
}

function func(name, values) {
    var objects = require('../objects');
    return new objects.Func(
        name,
        new objects.Expression(
            values.map(function(v, index) {
                if (typeof v === 'number')
                    v = new objects.Number(v);
                return [index ? ',' : null, v];
            })
        )
    );
}

function hslArgs(args) {
    var objects = require('../objects');
    args[1] = new objects.Dimension(new (objects.Number)(args[1]), '%');
    args[2] = new objects.Dimension(new (objects.Number)(args[2]), '%');
    return args;
}

var shortenHexColor = module.exports.shortenHexColor = function(hex) {
    if (hex[1] === hex[2] &&
        hex[3] === hex[4] &&
        hex[5] === hex[6]) {
        hex = '#' + hex[1] + hex[3] + hex[5];
    }
    return hex;
};

module.exports.color = function(color, alpha) {
    var hsl = color.hsl();
    var rgb = color.rgb();

    if (alpha === 1) {
        var hex = '#' + rgb.map(function(c) {
            var str = c.toString(16);
            if (str.length === 1)
                str = '0' + str;
            return str;
        }).join('');
        hex = shortenHexColor(hex);
        // We'll never convert to hsl() or rgb(), they're always longer.
        return new (require('../objects').HexColor)(hex.toLowerCase());
    } else {
        var rgba = 'rgba(' + rgb.join(',') + ',' + alpha + ')';
        var hsla = 'hsla(' + hsl.join('%,') + ',' + alpha + ')';
        if (rgba.length <= hsla.length)
            return func('rgba', rgb.concat([alpha]));
        else
            return func('hsla', hslArgs(hsl).concat([alpha]));
    }
}

// Units to be optimize when using --O1 only.
var opt_unit_o1_only = {
    cm: true,
    mm: true
    // ,turn: true  // Not compatible with Chrome yet :(
};
var length_units = {
    'in': 96,
    px: 1,
    pt: 4 / 3,
    pc: 16,
    cm: 37.79,
    mm: 3.779
};
var angular_units = {
    deg: 1,
    rad: 180 / Math.PI,
    grad: 9 / 10,
    turn: 360
};
var temporal_units = {
    s: 1000,
    ms: 1
};
var frequency_units = {
    Hz: 1,
    kHz: 1000
};
var resolution_units = {
    dpi: 1,
    dpcm: 1 / 2.54,
    dppx: 1 / 96
};

module.exports.unit = function(unit, kw) {
    var objects = require('../objects');

    function optimizeMin(unit, units) {
        var versions = {};
        var base_unit = units[unit.unit] * unit.number.asNumber();
        var shortest;
        var shortestLen = unit.toString().length;

        var temp;
        for (var i in units) {
            if (!kw.o1 && i in opt_unit_o1_only || i === 'turn' || i === unit.unit) continue;
            temp = versions[i] = new objects.Dimension(new (objects.Number)(base_unit / units[i]), i);
            // console.log(temp.toString());
            if (temp.toString().length < shortestLen) {
                shortest = i;
                shortestLen = temp.toString().length;
            }
        }
        if (!shortest) return unit;
        return versions[shortest];
    }

    switch (unit.unit) {
        // Length units
        case 'cm':
        case 'mm':
            if (!kw.o1) return unit;
        case 'in':
        case 'px':
        case 'pt':
        case 'pc':
            return optimizeMin(unit, length_units);
        // Angular units
        case 'deg':
        case 'rad':
        case 'grad':
        case 'turn':
            return optimizeMin(unit, angular_units);
        // Temporal units
        case 's':
        case 'ms':
            return optimizeMin(unit, temporal_units);
        // Frequency units
        case 'Hz':
        case 'kHz':
            return optimizeMin(unit, frequency_units);
        // Resolution units
        case 'dpi':
        case 'dpcm':
        case 'dppx':
            return optimizeMin(unit, resolution_units);
        default:
            return unit;
    }
};


module.exports.combineList = function(mapper, reducer, list) {
    mapper = mapper || utils.stringIdentity;
    reducer = reducer || function(a, b) {
        return a + b;
    };
    var values = {};
    for (var i = 0; i < list.length; i++) {
        var lval = mapper(list[i]);
        if (!(lval in values))
            values[lval] = list[i];
        else
            values[lval] = reducer(values[lval], list[i]);
    }
    var output = [];
    for (var key in values) {
        if (!values.hasOwnProperty(key)) continue;
        output.push(values[key]);
    }
    return output;
};
