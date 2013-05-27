import re

ident = re.compile(r'[a-z0-9]+')


class String(object):
    def __init__(self, value):
        self.value = value

    def __unicode__(self):
        if ident.match(self.value):
            return unicode(self.value)
        else:
            return u'"%s"' % self.value.replace('"', '\"')

