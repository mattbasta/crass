import sys
from parse import do_parse

if __name__ == '__main__':
    stylesheet = do_parse(sys.stdin.read())
    stylesheet.optimize()
    sys.stdout.write(unicode(stylesheet))

