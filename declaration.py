
class Declaration(object):
    def __init__(self, name, body, important=None):
        self.name = name
        self.body = body
        self.imp = important

    def __unicode__(self):
        base = u'%s:%s!important' if self.imp else u'%s:%s'
        return base % (self.name, self.body)

    def pretty(self):
        base = u'%s: %s !important' if self.imp else u'%s: %s'
        return base % (self.name, self.body)
