from optimization import extend, RemovalOptimization
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

    def optimize(self, **kw):
        self.selector = self.selector.optimize(statement=self, **kw)

        self.descriptors = filter(None, [
            d.optimize(**extend(kw, parent=self, index=i)) for i, d in
            enumerate(self.descriptors)])
        # OPT: Sort descriptors
        if kw.get('sort'):
            self.descriptors = sorted(self.descriptors, key=lambda d: d.name)
        return self


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

    def optimize(self, **kw):
        str_mqs = map(unicode, self.media_types)

        # Optimize media queries
        def opt(mq, index):
            try:
                return mq.optimize(**extend(kw, parent=self, index=index))
            except RemovalOptimization:
                return None

        self.media_types = filter(None, [
            opt(mq, i) for i, mq in enumerate(self.media_types) if
            unicode(mq) not in str_mqs[:i]])

        self._opt_imports(**kw)
        self._opt_statements(**kw)
        return self


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

    def optimize(self, **kw):
        self.descriptors = filter(None, [
            d.optimize(**extend(kw, parent=self, index=i)) for i, d in
            enumerate(self.descriptors)])
        return self


class Keyframes(Statement, Stylesheet):
    def __init__(self, name, frames, prefix=None):
        super(Keyframes, self).__init__()
        self.prefix = prefix or None
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

    def optimize(self, **kw):
        # OPT: Combine duplicate frames into the later frame
        def dedupe(frame, index):
            if index == 0:
                return frame
            str_sel = frame._unicode_selector()
            for prev_frame in self.frames[:index - 1]:
                if prev_frame._unicode_selector() == str_sel:
                    prev_frame.descriptors.extend(frame.descriptors)
                    return None
            return frame

        self.frames = filter(None, [
            dedupe(frame, i) for i, frame in enumerate(self.frames)])

        # Optimize each frame.
        self.frames = filter(None, [
            f.optimize(**extend(kw, parent=self, prefix=self.prefix)) for i, f in
            enumerate(self.frames)])

        parent = kw.get('parent')
        my_index = kw.get('index')

        if parent and my_index is not None:
            # OPT: Combine this keyframes with another duplicate keyframes
            # block in the document and then delete this one.
            for index, statement in enumerate(parent.statements[:my_index]):
                if (isinstance(statement, Keyframes) and
                        statement.prefix == self.prefix and
                        statement.name == self.name):

                    # If they're an exact match, just remove this one.
                    if unicode(statement) == unicode(self):
                        raise RemovalOptimization()

                    statement.frames.extend(self.frames)
                    parent.statements[index] = statement.optimize(**kw)
                    raise RemovalOptimization()
        return self


class Keyframe(Statement):

    def _unicode_selector(self):
        return u','.join(unicode(s) for s in self.selector)

    def __unicode__(self):
        return u'%s{%s}' % (
                self._unicode_selector(),
                u';'.join(unicode(d) for d in self.descriptors))

    def pretty(self):
        return u'%s {\n    %s\n}' % (
                u', '.join(s.pretty() for s in self.selector),
                u';\n    '.join(d.pretty() for d in self.descriptors))

    def optimize(self, **kw):
        # OPT: Remove duplicate selectors for one keyframe.
        str_sels = map(unicode, self.selector)
        self.selector = [sel for i, sel in enumerate(self.selector) if
                         unicode(sel) not in str_sels[:i]]

        self.descriptors = filter(None, [
            d.optimize(**extend(kw, parent=self, index=i)) for i, d in
            enumerate(self.descriptors)])
        return self


class KeyframeSelector(object):
    def __init__(self, value):
        self.value = value

    def __unicode__(self):
        if isinstance(self.value, (str, unicode)):
            return self.value.lower()
        else:
            # The only other option is percents.
            return '%s%%' % unicode(self.value)

    def pretty(self):
        return unicode(self)
