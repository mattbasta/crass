from statement import Statement


class Stylesheet(object):
    def __init__(self):
        super(Stylesheet, self).__init__()

        # Statements is a list of Statement objects.
        self.statements = []
        # Imports is a list of tuples in the form:
        # (url, list(media types) or None)
        self.imports = []

        # The default namespace URL or None.
        self.default_namespace = None
        # An identifier-URL mapping for namespaces.
        self.namespaces = {}

        # The document charset or None. (@charset)
        self.charset = None

    def optimize(self):
        # TODO: remove duplicate imports
        # TODO: optimize statements
        # TODO: compact statements
        pass

    def __unicode__(self):
        output = []

        # Add charset
        if self.charset:
            output.append(u'@charset "%s";' % self.charset)

        # Add namespaces
        if self.default_namespace:
            output.append(u'@namespace "%s";' % self.default_namespace)
        if self.namespaces:
            for keyword, url in self.namespaces.items():
                output.append(u'@namespace %s "%s";' % (keyword, url))

        # Add imports
        for imp in self.imports:
            url, media_types = imp
            media = u''
            if media_types:
                media = u' %s' % u','.join(media_types)
            output.append(u'@import "%s";' % url)

        # Add statements
        output.append(''.join(unicode(s) for s in self.statements))

        return u''.join(output)

    def pretty(self):
        output = []

        # Add charset
        if self.charset:
            output.append(u'@charset "%s";' % self.charset)

        # Add namespaces
        if self.default_namespace:
            output.append(u'@namespace "%s";' % self.default_namespace)
        if self.namespaces:
            for keyword, url in self.namespaces.items():
                output.append(u'@namespace %s "%s";' % (keyword, url))

        # Add imports
        for imp in self.imports:
            url, media_types = imp
            media = u''
            if media_types:
                media = u' %s' % u', '.join(media_types)
            output.append(u'@import "%s";' % url)

        # Add statements
        for stmt in self.statements:
            output.append(stmt.pretty())

        return u'\n'.join(output)


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
                u','.join(q.pretty() for q in self.media_types),
                u'\n    '.join(s.pretty() for s in self.statements))

