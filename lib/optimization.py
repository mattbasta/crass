class RemovalOptimization(Exception):
    pass


HTML_PREFIXES = ['moz-', 'webkit-', 'blink-', 'ms-', 'o-']
CSS_PREFIXES = ['-moz-', '-webkit-', '-blink-', '-ms-', '-o-']


def extend(input, **kw):
    x = dict(input)
    x.update(**kw)
    return x
