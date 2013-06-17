from optimization import CSS_PREFIXES


class Declaration(object):
    def __init__(self, name, body, important=None):
        self.name = name.lower()
        self.body = body
        self.imp = important

    def __unicode__(self):
        base = u'%s:%s!important' if self.imp else u'%s:%s'
        return base % (self.name, self.body)

    def pretty(self):
        base = u'%s: %s !important' if self.imp else u'%s: %s'
        return base % (self.name, self.body)

    def optimize(self, **kw):
        prefix = kw.get('prefix')
        # OPT(IE): Remove IE declaration hacks
        if self.name.startswith('_'):
            return None

        # OPT: Remove mismatched prefixed declarations.
        if (prefix and
            any(self.name.startswith(p) for p in CSS_PREFIXES) and
            not self.name.startswith(prefix)):
            return None
        return self
