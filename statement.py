
class Statement(object):
    def __init__(self, selector, descriptors):
        self.selector = selector
        self.descriptors = descriptors

    def __unicode__(self):
        return u'%s{%s}' % (self.selector,
                            u';'.join(self.descriptors))

    def __repr__(self):
        return unicode(self)

