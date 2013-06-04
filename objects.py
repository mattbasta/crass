import re

ident = re.compile(r'[a-z0-9]+')


class String(object):
    def __init__(self, value):
        self.value = value

    def __unicode__(self):
        return u'"%s"' % self.value.replace('"', '\"')

class Number(object):
    def __init__(self, value):
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

