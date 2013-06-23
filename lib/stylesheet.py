from optimization import RemovalOptimization


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

    def _opt_imports(self, kw):
        # Remove duplicate imports
        self.imports = [imp for i, imp in enumerate(self.imports) if
                        # Exact duplicates
                        imp not in self.imports[:i] and
                        # Un-mediaed duplicates
                        (imp[0], None) not in self.imports[:i]]

    def _opt_statements(self, kw):
        # Optimize statements
        def opt(statement, index):
            try:
                return statement.optimize(parent=self, index=index)
            except RemovalOptimization:
                print "Removing %s" % statement
                return None

        self.statements = filter(None, [opt(s, i) for i, s in
                                        enumerate(self.statements)])

    def optimize(self, **kw):
        self._opt_imports(kw)
        self._opt_statements(kw)
        return self

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

