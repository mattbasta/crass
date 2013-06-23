import colorsys
import re

ident = re.compile(r'[a-z0-9]+')
num_types = (int, float, long, complex, )
numable_types = num_types + (str, unicode, )


def _esc(char):
    if u' ' <= char <= u'~' or ord(char) > 127:
        return char
    return ur'\%s' % char


class String(object):
    @classmethod
    def off(cls, value):
        if isinstance(value, String):
            return value.value
        return value

    @classmethod
    def quote(cls, value, other_chars=None):
        if isinstance(value, String):
            return value
        elif (u'"' in value or u"'" in value or
              other_chars and any(c in value for c in other_chars)):
            return String(value)
        return value

    def __init__(self, value):
        self.value = value

    def __unicode__(self):
        # OPT: Use the shortest version of the quoted string.
        value = u''.join(_esc(c) for c in self.value)
        sq_ = u"'%s'" % value.replace(u"'", ur"\'")
        dq_ = u'"%s"' % value.replace(u'"', ur'\"')
        return dq_ if len(dq_) < len(sq_) else sq_

    def pretty(self):
        return unicode(self)


class Number(object):
    @classmethod
    def off(cls, num):
        if isinstance(num, Number):
            return num.as_py_num()
        return num

    @classmethod
    def on(cls, num):
        return Number(num) if isinstance(num, numable_types) else num

    def __init__(self, value):
        value = unicode(value)
        self.value = value.lstrip(u'-')
        self.sign = u'-' if value.startswith(u'-') else u''

    def apply_unary(self, operator):
        if operator == u'-':
            self.sign = u'-' if not self.sign else u''

    def __unicode__(self):
        sign, num = self.get_value()
        if num:
            return sign + num
        else:
            return u'0'

    def pretty(self):
        return unicode(self)

    def get_value(self):
        if not self.value:
            return u'0'
        val = unicode(self.value)
        if u'.' in val:
            whole, dec = val.split(u'.', 1)
            # OPT: Cap floating point #s at 4 decimal places.
            # OPT: Strip trailing zeroes
            val = u'%s.%s' % (whole, dec[:4].rstrip('0'))

        # OPT: Strip leading zeroes
        # OPT: Remove spurious decimals (1.0 -> 1)
        val = val.lstrip(u'0').rstrip(u'.')

        return self.sign, val or u'0'

    def as_py_num(self, as_int=False):
        val = self.value
        if val[0] == '.':
            val = '0%s' % val

        return (int if as_int else float)(self.sign + val)

    def optimize(self, **kw):
        return self


class Dimension(object):
    def __init__(self, number, unit):
        self.number = number
        self.unit = unit.lower()

    def __unicode__(self):
        return u'%s%s' % (self.number, self.unit)

    def pretty(self):
        return unicode(self)

    def optimize(self, **kw):
        # OPT: Strip unnecessary units from zero
        if unicode(self.number) == u'0' and not kw.get('dont_strip'):
            self.unit = ''
        # TODO: Add optimizations
        return self


same = lambda s: s[0] == s[1]

class Color(object):

    @classmethod
    def fromhex(cls, hex_):
        hex_ = hex_.lstrip('#')
        hlen = len(hex_)

        if hlen == 3:
            return Color(int(hex_[0], 16), int(hex_[1], 16), int(hex_[2], 16))
        elif hlen == 6:
            return Color(
                int(hex_[0:2], 16), int(hex_[2:4], 16), int(hex_[4:6], 16))

        raise Exception('Invalid hex color')

    @classmethod
    def fromrgb(cls, red, grn, blu, alpha=1.0):
        def norm(val):
            if isinstance(val, Dimension):
                if val.unit != u'%':
                    raise Exception('Invalid color value')
                val = max(min(Number.off(val.number), 100), 0)
                return int(val / 100 * 255)
            return Number.off(val)
        return Color(norm(red), norm(grn), norm(blu), alpha)

    @classmethod
    def fromhsl(cls, hue, sat, lig, alpha=1.0):
        def norm(val, percentage=False):
            is_dim = isinstance(val, Dimension)
            if percentage and not is_dim:
                raise Exception('Invalid HSL color')
            if is_dim:
                if val.unit != u'%':
                    raise Exception('Invalid color value')
                val = max(min(Number.off(val.number), 100), 0)
                if percentage:
                    return val / 100
                return int(val / 100 * 255)
            return Number.off(val)
        hue, sat, lig = norm(hue) / 255, norm(sat, True), norm(lig, True)
        red, grn, blu = colorsys.hls_to_rgb(hue, lig, sat)
        return Color(red * 255, grn * 255, blue * 255, alpha)

    def __init__(self, red, grn, blu, alpha=1.0):
        self.red = int(red)
        self.green = int(grn)
        self.blue = int(blu)
        self.alpha = alpha
        self.alpha_val = Number.off(alpha)

    def _as_hex(self):
        # OPT: Lowercase hex values
        rh = u'%02x' % self.red
        gh = u'%02x' % self.green
        bh = u'%02x' % self.blue

        # OPT: Shorten #XXYYZZ -> #XYZ
        if same(rh) and same(gh) and same(bh):
            rh = rh[0]
            gh = gh[0]
            bh = bh[0]

        return u'#%s%s%s' % (rh, gh, bh)

    def _get_base_func(self, args, wo_alpha, w_alpha, pretty):
        is_alpha = self.alpha_val != 1
        func = w_alpha if is_alpha else wo_alpha
        base = u'%s(%%s)' % func
        if is_alpha:
            args.append(self.alpha)

        args = [Number.on(i) for i in args]
        stringify = (lambda i: i.pretty() if pretty and
                               not isinstance(i, num_types) else unicode(i))

        return base % (u', ' if pretty else u',').join(
            stringify(a) for a in args)

    def _as_rgb(self, pretty=False):
        return self._get_base_func(
            [self.red, self.green, self.blue], u'rgb', u'rgba', pretty)

    def _as_hsl(self, pretty=False):
        rgb = [Number.off(i) / 255 for i in (self.red, self.green, self.blue)]

        hue, lig, sat = colorsys.rgb_to_hls(*rgb)
        sat = Dimension(Number(int(sat * 100)), u'%')
        lig = Dimension(Number(int(lig * 100)), u'%')
        return self._get_base_func(
            [int(hue * 255), sat, lig], u'hsl', u'hsla', pretty)

    def _to_unicode(self, pretty=False):
        # OPT: Use the shortest possible representation of the color.
        choices = [
            self._as_rgb(pretty),
            self._as_hsl(pretty),
        ]
        if self.alpha_val == 1:
            choices.insert(0, self._as_hex())

        return min(choices, key=len)

    def __unicode__(self):
        return self._to_unicode()

    def pretty(self):
        return self._to_unicode(pretty=True)

    def optimize(self, **kw):
        return self


class LinearFunc(object):
    def __init__(self, coef, offset):
        self.coef = coef
        self.offset = offset

    def match(self, offset):
        coef, i_offset = 0, 0
        if self.coef:
            coef = self.coef.as_py_num(as_int=True)
        if self.offset:
            i_offset = self.offset.as_py_num(as_int=True)

        if coef:
            # mn + b
            return (offset - i_offset) % coef == 0
        else:
            # b
            return i_offset == offset

    def _get_coefficient(self):
        if not self.coef:
            return None
        coef = unicode(self.coef)
        if coef == u'1':
            return u'n'
        elif coef == u'-1':
            return u'-n'
        else:
            return u'%sn' % unicode(coef)

    def _get_offset(self, pretty=False):
        if not self.offset:
            return None
        off_sign, off_val = self.offset.get_value()
        off_sign = off_sign or u'+'

        # OPT: Xn [+-] 0 -> Xn
        if self.coef and off_val == u'0':
            return None

        if pretty:
            if self.coef:
                return u'%s %s' % (off_sign, off_val)
            elif off_sign == u'-':
                return off_sign + off_val
            # OPT: +X -> X
            else:
                return off_val
        else:
            # OPT: +X -> X
            if not self.coef and off_sign == u'+':
                return off_val
            else:
                return off_sign + off_val

    def __unicode__(self):
        coef = self._get_coefficient() or u''
        offset = self._get_offset() or u''
        return coef + offset

    def pretty(self):
        coef = self._get_coefficient() or u''
        offset = self._get_offset(pretty=True) or u''
        if coef and offset:
            return u'%s %s' % (coef, offset)
        else:
            return coef or offset


class URI(object):
    def __init__(self, value):
        self.value = String.off(value)

    def __unicode__(self):
        return u'url(%s)' % unicode(String.quote(self.value, u'()'))

    def pretty(self):
        return unicode(self)

    def optimize(self, **kw):
        # TODO: Perform path optimizations (not on data URI)
        return self
