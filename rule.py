from optimization import CSS_PREFIXES, HTML_PREFIXES, RemovalOptimization


class Rule(object):
    def match(self, element):
        return True

    def __unicode__(self):
        return u''

    def pretty(self):
        return unicode(self)

    def optimize(self, **kw):
        return self


class RuleType(Rule):
    def __init__(self, type_):
        self.type_ = type_.lower()

    def match(self, element):
        if '|' in self.type_:
            namespace, type_ = self.type_.split('|', 1)
            if not namespace:
                namespace = None
            elif namespace != '*':
                namespace = self.sheet.namespaces.get(namespace)
                if not namespace:
                    return False
            return ((element.type_ == type_ or type_ == '*') and
                    (element.namespace == namespace or namespace == '*') and
                    self.base.match(element))
        return element.type_ == self.type_ or self.type_ == '*'

    def __unicode__(self):
        return self.type_


class RuleClass(Rule):
    def __init__(self, class_):
        self.class_ = class_

    def match(self, element):
        return element.class_ in self.class_list

    def __unicode__(self):
        return u'.%s' % self.class_


class RuleID(Rule):
    def __init__(self, id_):
        self.id_ = id_

    def match(self, element):
        return element.id_ == self.id_

    def __unicode__(self):
        return u'#%s' % self.id_


class RuleAttribute(Rule):
    def __init__(self, attr_name, binop, attr_value):
        self.attr_name = attr_name
        self.binop = binop
        self.attr_value = attr_value

    def match(self, element):
        if attr_name not in element.attributes:
            return False

        # TODO: Support attribute namespaces (6.3.3)

        attr_val = self.attr_value
        el_val = element.attributes.get(element, '')
        if self.binop == '=':
            return el_val == attr_val
        elif self.binop == '~=':
            return attr_val in el_val.split() or not attr_val
        elif self.binop == '|=':
            return attr_val == el_val or el_val.startswith('%s-' % attr_val)
        elif self.binop == '^=':
            return el_val.startswith(attr_val)
        elif self.binop == '$=':
            return el_val.endswith(attr_val)
        elif self.binop == '*=':
            return attr_val in el_val

    def __unicode__(self):
        generated = self.attr_name
        if self.binop:
            generated += self.binop
            generated += self.attr_value
        return u'[%s]' % generated

    def optimize(self, **kw):
        prefix = kw.get('prefix')
        if (prefix and
                any(self.attr_name.startswith(p) for p in HTML_PREFIXES) and
                not self.attr_name.startswith(prefix)):
            raise RemovalOptimization()
        return self


class RulePseudoClass(Rule):
    def __init__(self, pseudoclass, extra=None):
        self.pseudoclass = pseudoclass.lower()
        self.extra = extra

    def match(self, element):
        pc = self.pseudoclass
        passes = False
        if pc == 'root':
            passes = element.documentElement.childNodes[0] == element
        elif pc == 'nth-child':
            raise Exception('TODO: Implement me!')
            pass
        elif pc == 'nth-last-child':
            raise Exception('TODO: Implement me!')
            pass
        elif pc == 'nth-of-type':
            raise Exception('TODO: Implement me!')
            pass
        elif pc == 'nth-last-of-type':
            raise Exception('TODO: Implement me!')
            pass
        elif pc == 'first-child':
            passes = element.parentNode.childNodes[0] == element
        elif pc == 'last-child':
            passes = element.parentNode.childNodes[-1] == element
        elif pc == 'first-of-type':
            for el in element.parentNode.childNodes:
                if el == element:
                    passes = True
                    break
                if el.type_ == element.type_:
                    break
        elif pc == 'last-of-type':
            for el in reversed(element.parentNode.childNodes):
                if el == element:
                    passes = True
                    break
                if el.type_ == element.type_:
                    break
        elif pc == 'only-child':
            passes = len(element.parentNode.childNodes)
        elif pc == 'only-of-type':
            passes = not any(
                    el.type_ == element.type_ for el in
                    element.parentNode.childNodes if
                    el != element)
        elif pc == 'empty':
            passes = not element.childNodes
        elif pc == 'not':
            passes = not self.extra.match(element)
        else:
            return False

        return passes and self.base.match(element)

    def __unicode__(self):
        generated = u':%s' % self.pseudoclass
        if self.extra:
            generated += u'(%s)' % self.extra
        return generated

    def pretty(self):
        if self.extra and getattr(self.extra, 'pretty'):
            return u':%s(%s)' % (self.pseudoclass, self.extra.pretty())
        elif self.extra:
            return u':%s(%s)' % (self.pseudoclass, self.extra)
        return super(RulePseudoClass, self).pretty()

    def optimize(self, **kw):
        prefix = kw.get('prefix')
        if (prefix and
                any(self.pseudoclass.startswith(p) for p in CSS_PREFIXES) and
                not self.pseudoclass.startswith(prefix)):
            raise RemovalOptimization()

        # Support for `:not()`. Don't worry about prefixes for this because
        # we're dealing with negation.
        if self.pseudoclass == u'not':
            inner_kw = dict(kw)
            inner_kw['not'] = True
            if 'prefix' in inner_kw:
                del inner_kw['prefix']
            self.extra = self.extra.optimize(**inner_kw)

        return self


class RulePseudoElement(Rule):
    def __init__(self, pseudoelement):
        self.pseudoelement = pseudoelement.lower()

    def match(self, element):
        return False

    def __unicode__(self):
        return u'::%s' % self.pseudoelement

    def optimize(self, **kw):
        prefix = kw.get('prefix')
        if (prefix and
                any(self.pseudoelement.startswith(p) for p in CSS_PREFIXES) and
                not self.pseudoelement.startswith(prefix)):
            raise RemovalOptimization()
        return self
