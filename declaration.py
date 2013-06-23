import objects
from optimization import CSS_PREFIXES


identity = lambda x: x


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

        if getattr(self.body, 'optimize', None):
            self.body = self.body.optimize(decl=self.name, **kw)

        return self


# A list of declarations which shouldn't use dimensional optimizations.
NON_DIM_DECLS = [u'background-position', u'transform-origin']

class Expression(object):
    def __init__(self, first_term, term_list=None):
        self.terms = [(None, first_term)]
        for term in term_list or []:
            self.terms.append(term)

    def __unicode__(self):
        output = []
        for op, term in self.terms:
            if not op and output:
                output.append(u' ')
            elif op:
                output.append(op)
            output.append(term)

        return u''.join(unicode(x) for x in output)

    def pretty(self):
        return u' '.join(
            ('%s %s' % (op, term) if op else term) for op, term in self.terms)

    def _opt_dimensions(self, **kw):
        if kw.get('decl') in NON_DIM_DECLS:
            return

        # If there's too many or too few operators, it's not a dim. decl.
        num_terms = len(self.terms)
        if num_terms < 2 or num_terms > 4:
            return
        # If there's an operator or anything isn't a dimension, it's not a
        # dim. decl.
        is_not_dim = lambda term: not isinstance(
            term, objects.numable_types + (objects.Dimension, objects.Number))
        if any(op or is_not_dim(term) for op, term in self.terms):
            return

        # Simple shortcut for accessing stringified terms.
        _t = [unicode(term) for op, term in self.terms]

        # OPT: x x[ x[ x]] -> x
        if _t[0] == _t[1] and all(t == _t[0] for t in _t[2:]):
            self.terms = [self.terms[0]]

        # OPT: x y x y -> x y
        elif num_terms == 4 and _t[0] == _t[2] and _t[1] == _t[3]:
            self.terms = self.terms[:2]

        # OPT: x y z y -> x y z
        elif num_terms == 4 and _t[1] == _t[3]:
            self.terms = self.terms[:3]

        # OPT: x y x -> x y
        if len(self.terms) == 3 and _t[0] == _t[2]:
            self.terms = self.terms[:2]


    def optimize(self, **kw):
        optimize = (
            lambda term: getattr(term, 'optimize', lambda **kw: term)(**kw))
        self.terms = [(op, optimize(term)) for op, term in self.terms]
        self._opt_dimensions(**kw)
        return self


class Function(object):
    # TODO: Move this somewhere else?
    def __init__(self, name, content):
        self.name = name
        self.content = content

    def __unicode__(self):
        return u'%s(%s)' % (self.name, self.content)

    def pretty(self):
        return unicode(self)

    def optimize(self, **kw):
        if (self.name in (u'rgb', u'rgba') and
            isinstance(self.content, Expression)):
            return objects.Color.fromrgb(*[
                term for op, term in self.content.terms])
        if (self.name in (u'hsl', u'hsla') and
            isinstance(self.content, Expression)):
            return objects.Color.fromhsl(*[
                term for op, term in self.content.terms])
        return self
