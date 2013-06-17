from optimization import RemovalOptimization


class Selector(object):
    def pretty(self):
        return unicode(self)

    def optimize(self, **kw):
        return self


class MultiSelector(Selector):

    def __init__(self, selectors):
        self.selectors = selectors

    def matches(self, element):
        return any(s.matches(element) for s in self.selectors)

    def __unicode__(self):
        return u','.join(unicode(s) for s in self.selectors)

    def pretty(self):
        return u',\n'.join(s.pretty() for s in self.selectors)

    def optimize(self, **kw):
        str_sels = map(unicode, self.selectors)

        # OPT: If multiselector contains wildcard, simplify to wildcard.
        if u'*' in str_sels:
            from rule import RuleType
            return SimpleSelector([RuleType(u'*')])

        def opt(sel, index):
            try:
                return sel.optimize(**kw)
            except RemovalOptimization:
                return None

        # OPT: Remove duplicate selectors in multiselectors.
        self.selectors = filter(None, [sel.optimize(**kw) for i, sel in
                                       enumerate(self.selectors) if
                                       unicode(sel) not in str_sels[:i]])
        if not self.selectors:
            raise RemovalOptimization()

        # OPT: Sort complex selectors in multiselectors
        self.selectors = sorted(
            self.selectors, cmp=lambda a, b: cmp(unicode(a), unicode(b)))

        return self


class SimpleSelector(Selector):
    def __init__(self, rules=None):
        self.rules = rules or []

    def matches(self, element):
        return all(r.match(element) for r in self.rules)

    def __unicode__(self):
        return u''.join(unicode(r) for r in self.rules)

    def pretty(self):
        return u''.join(r.pretty() for r in self.rules)

    def optimize(self, **kw):
        if len(self.rules) == 1:
            self.rules[0] = self.rules[0].optimize(**kw)
            return self

        str_rules = map(unicode, self.rules)

        # Allow RemovalOptimizations to bubble up.
        # OPT: Remove wildcard from simple selectors.
        self.rules = [r.optimize(**kw) for i, r in enumerate(self.rules) if
                      unicode(r) not in str_rules[:i] and
                      unicode(r) != u'*']
        return self


class DescendantSelector(Selector):
    def __init__(self, ancestor, descendant):
        self.ancestor = ancestor
        self.descendant = descendant

    def matches(self, element):
        if not element.parentNode or not self.descendant.matches(element):
            return False
        parent = element.parentNode
        while parent:
            if self.ancestor.matches(parent):
                return True
            parent = element.parentNode
        return False

    def __unicode__(self):
        return u'%s %s' % (self.ancestor, self.descendant)

    def pretty(self):
        return u'%s %s' % (self.ancestor.pretty(), self.descendant.pretty())

    def optimize(self, **kw):
        self.ancestor = self.ancestor.optimize(**kw)
        self.descendant = self.descendant.optimize(**kw)
        return self


class DirectDescendantSelector(DescendantSelector):
    def matches(self, element):
        return (self.descendant.matches(element) and
                self.ancestor.matches(element.parentNode))

    def __unicode__(self):
        return u'%s>%s' % (self.ancestor, self.descendant)

    def pretty(self):
        return u'%s > %s' % (self.ancestor.pretty(), self.descendant.pretty())

    def optimize(self, **kw):
        self.ancestor = self.ancestor.optimize(**kw)
        self.descendant = self.descendant.optimize(**kw)
        return self


class AdjacencySelector(Selector):
    def __init__(self, first, second):
        self.first = first
        self.second = second

    def matches(self, element):
        if not element.previousSibling:
            return False
        return (self.second.matches(element) and
                self.first.matches(element.previousSibling))

    def __unicode__(self):
        return u'%s+%s' % (self.first, self.second)

    def pretty(self):
        return u'%s + %s' % (self.first.pretty(), self.second.pretty())

    def optimize(self, **kw):
        self.first = self.first.optimize(**kw)
        self.second = self.second.optimize(**kw)
        return self


class SiblingSelector(Selector):
    def __init__(self, first, second):
        self.first = first
        self.second = second

    def matches(self, element):
        if not element.previousSibling or not self.second.matches(element):
            return False
        previous = element.previousSibling
        while previous:
            if self.first.matches(previous):
                return True
            previous = element.previousSibling

        return False

    def __unicode__(self):
        return u'%s~%s' % (self.first, self.second)

    def pretty(self):
        return u'%s ~ %s' % (self.first.pretty(), self.second.pretty())

    def optimize(self, **kw):
        self.first = self.first.optimize(**kw)
        self.second = self.second.optimize(**kw)
        return self
