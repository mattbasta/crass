
class Stylesheet(object):
    def __init__(self):
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

        # A list of @media blocks in the sheet.
        self.media = []

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

        # Add media
        if self.media:
            for media in self.media:
                output.append(unicode(media))

        return u''.join(output)


class MediaQuery(Stylesheet):
    def __init__(self, media_types, query, *args, **kw):
        super(MediaQuery, self).__init__(*args, **kw)
        self.media_types = media_types
        self.query = query

    def __unicode__(self):
        raise Exception('Not Implemented yet')

