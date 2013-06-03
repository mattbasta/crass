
class MediaQuery(object):
    def __init__(self, media_type=None, media_type_modifier=None, media_exprs=None):
        if not media_type and not media_exprs:
            raise Exception('Undefined media queries are not allowed.')
        self.media_type = media_type
        self.media_type_modifier = media_type_modifier
        self.media_exprs = media_exprs

    def match(self, element):
        # TODO: Figure out a good matching API for these.
        return False

    def __unicode__(self):
        return self._output()

    def pretty(self):
        return self._output(pretty=True)

    def _output(self, pretty=False):
        output = []
        if self.media_type:
            if self.media_type_modifier:
                output.append(self.media_type_modifier)
            output.append(self.media_type)

        if self.media_type and self.media_exprs:
            output.append(u'and')

        if self.media_exprs:
            exprs = []
            for expr in self.media_exprs:
                exprs.append(unicode(expr))
            # XXX: We assume that the expressions come out with parens already
            # around them.
            combiner = u' and ' if pretty else u'and'
            output.append(combiner.join(exprs))

        return u' '.join(output)


class MediaExpr(object):
    def __init__(self, key, value=None):
        self.key = key
        self.value = value

    def __unicode__(self):
        if self.value:
            return u'(%s:%s)' % (self.key, self.value)
        else:
            return u'(%s)' % self.key

    def pretty(self):
        if self.value:
            return u'(%s: %s)' % (self.key, self.value)
        else:
            return unicode(self)

