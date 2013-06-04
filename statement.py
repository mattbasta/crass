from stylesheet import Stylesheet


class Statement(object):
    def __init__(self, selector=None, descriptors=None):
        super(Statement, self).__init__()
        self.selector = selector
        self.descriptors = descriptors

    def __unicode__(self):
        if not self.descriptors:
            return u''
        return u'%s{%s}' % (self.selector,
                            u';'.join(unicode(d) for d in self.descriptors))

    def __repr__(self):
        return unicode(self)

    def pretty(self):
        return u'%s {\n    %s;\n}' % (
                self.selector.pretty(),
                u';\n    '.join(d.pretty() for d in self.descriptors))


class MediaQuery(Statement, Stylesheet):
    def __init__(self, media_types):
        super(MediaQuery, self).__init__()
        self.media_types = media_types

    def __unicode__(self):
        return u'@media %s{%s}' % (
                u','.join(unicode(q) for q in self.media_types),
                u''.join(unicode(s) for s in self.statements))

    def pretty(self):
        return u'@media %s {\n    %s\n}' % (
                u', '.join(q.pretty() for q in self.media_types),
                u'\n    '.join(s.pretty() for s in self.statements))


class FontFace(Statement):
    def __init__(self, descriptors):
        self.descriptors = descriptors

    def __unicode__(self):
        if not self.descriptors:
            return u''
        return u'@font-face{%s}' % (
                u';'.join(unicode(d) for d in self.descriptors))

    def pretty(self):
        return u'@font-face {\n    %s;\n}' % (
                u';\n    '.join(d.pretty() for d in self.descriptors))


class Keyframes(Statement, Stylesheet):
    def __init__(self, name, frames, prefix=None):
        super(Keyframes, self).__init__()
        self.prefix = prefix
        self.name = name
        self.frames = frames

    def __unicode__(self):
        return u'@%skeyframes %s{%s}' % (
                self.prefix or u'',
                self.name,
                u''.join(unicode(f) for f in self.frames))

    def pretty(self):
        return u'@%skeyframes %s {\n    %s\n}' % (
                self.prefix or u'',
                self.name,
                u'\n    '.join(f.pretty() for f in self.frames))


class Keyframe(object):
    def __init__(self, selectors, descriptors):
        self.selectors = selectors
        self.descriptors = descriptors

    def __unicode__(self):
        return u'%s{%s}' % (
                u','.join(unicode(s) for s in self.selectors),
                u';'.join(unicode(d) for d in self.descriptors))

    def pretty(self):
        return u'%s {\n    %s\n}' % (
                u', '.join(s.pretty() for s in self.selectors),
                u';\n    '.join(d.pretty() for d in self.descriptors))


class KeyframeSelector(object):
    def __init__(self, value):
        self.value = value

    def __unicode__(self):
        if isinstance(self.value, (str, unicode)):
            return self.value
        else:
            # The only other option is percents.
            return '%s%%' % unicode(self.value)

    def pretty(self):
        return unicode(self)

