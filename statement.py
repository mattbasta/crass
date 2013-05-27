
class Statement(object):
    def __init__(self, selector, descriptors):
        self.selector = selector
        self.descriptors = descriptors

    def __unicode__(self):
        if not self.descriptors:
            return u''
        return u'%s{%s}' % (self.selector,
                            u';'.join(unicode(d) for d in self.descriptors))

    def __repr__(self):
        return unicode(self)

