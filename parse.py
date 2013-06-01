from parsimonious import Grammar
from parsimonious.nodes import NodeVisitor


# Adapted from https://raw.github.com/bhyde/css-parser/master/css.peg:
# This is an incredibly inefficient grammar, but it would be simple to
# optimize. Eventually, Parsimonious will know how to do that automatically.
css = Grammar(r"""
    program = S* stylesheet
    stylesheet = ("@charset" S* STRING S* ";")? SCC (import SCC)* (namespace SCC)* ((ruleset / media / page / font_face / keyframes) SCC)*
    SCC = S / CDO / CDC
    import = "@import" S* (STRING / URI) S* medium_list? ";" S*
    namespace = "@namespace" S* (IDENT S*)? (STRING / URI) S* ";" S*
    media = "@media" medium_list "{" (ruleset / media)* "}" S*
    medium_list = S* media_query ("," S* media_query)*
    media_query = media_query_type / media_query_expr
    media_query_type = ("only" / "not")? S* IDENT S* ("and" S* media_expr)*
    media_query_expr = media_expr ("and" S* media_expr)*
    media_expr = "(" S* IDENT S* (":" S* expr)? ")" S*
    page = "@page" S* IDENT? pseudo_page? S* "{" S* declaration_list? "}" S*
    pseudo_page = ":" IDENT
    font_face = "@font-face" S* "{" S* declaration_list? "}" S*
    keyframes = "@" ~r"\-[a-zA-Z]+\-"? "keyframes" S* IDENT S* "{" S* keyframe+ "}" S*
    keyframe = keyframe_selector_list "{" S* declaration_list? "}" S*
    keyframe_selector_list = keyframe_selector S* ("," S* keyframe_selector S*)*
    keyframe_selector = (num "%") / "from" / "to"
    combinator = ("+" / ">" / "~") S*
    unary_operator = "-" / "+"
    property = IDENT S*
    ruleset = more_selector S* "{" S* declaration_list? "}" S*
    more_selector = selector (S* "," S* selector)*

    h = ~r"[0-9a-fA-F]"
    wc = ~r"[ \n\r\t\f]"
    nonascii = ~r"[\u0080-\ud7ff\ue000-\ufffd\u10000-\u10ffff]"
    unicode = "\\" ~r"[0-9a-fA-F]{1,6}" wc?
    escape = unicode / ("\\" ~r"[\u0020-\u007E\u0080-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]")
    nmstart = ~"[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_]" / escape # / nonascii
    nmchar = nmstart / ~"[0123456789-]"
    string1 = "\"" (~r"[\t \!#\$%&\(-~]" / ("\\" nl) / "\'" / nonascii / escape)* "\""
    string2 = "\'" (~r"[\t \!#\$%&\(-~]" / ("\\" nl) / "\"" / nonascii / escape)* "\'"
    # XXX: URLs cannot contain parentheses
    urlchar = ~r"[\t!#\$%&\'*+,\-./0-9:-~]"  / escape #/ nonascii

    IDENT = "-"? nmstart nmchar*
    name = nmchar+
    digit = ~r"[0-9]"
    num = digit+ / (digit* "." digit+)
    STRING = string1 / string2
    url = urlchar+
    w = wc*
    nl = "\n" / "\r\n" / "\r" / "\f"

    comment = "/*" (!"*/" ~".")* "*/"
    S = w / comment

    CDO = "<!--"
    CDC = "-->"

    HASH = "#" name

    IMPORTANT_SYM = "!" w "important"

    DIMENSION = num (IDENT / "%")

    URI = "url(" w (STRING / url) w ")"

    selector = simple_selector selector_trailer?
    selector_trailer = selector_trailer_a / selector_trailer_b / selector_trailer_c / selector_trailer_d
    selector_trailer_a = combinator selector
    selector_trailer_b = S+ combinator selector
    selector_trailer_c = S+ selector
    selector_trailer_d = S+

    simple_selector = (element_name simple_selector_etc*) / (simple_selector_etc+)
    simple_selector_etc = id_selector / class_selector / attrib_selector / pseudo_selector

    element_type = (IDENT / "*")
    element_ns = "|" IDENT
    element_name = (element_type element_ns?) / element_ns

    id_selector     = "#" IDENT
    class_selector  = "." IDENT
    attrib_selector = "[" S* IDENT ( ("=" / "~=" / "|=" / "^=" / "$=" / "*=") S* ( IDENT / STRING ) S*)? "]"
    pseudo_selector = ":" ":"? IDENT ("(" S* (nth / more_selector / expr) S* ")")?

    integer = digit+
    nth = S* (nth_body_full / nth_body_num / "odd" / "even") S*
    nth_body_full = unary_operator? integer? "n" (S* unary_operator S* integer)?
    nth_body_num = unary_operator? integer

    declaration_list = declaration (";" S* declaration)* ";"? S*
    declaration = property ":" S* expr S* IMPORTANT_SYM? S*
    expr = term ( operator term )*
    math_expr = math_product (S+ ("+" / "-") S+ math_product)*
    math_product = unit (S* (("*" S* unit) / ("/" S* num)))*
    calc = "calc(" S* math_expr S* ")"
    attr = "attr(" S* element_name (S+ IDENT)? S* ("," (unit / calc) S*)? ")"
    operator = ("/" / ",")? S*
    unit = DIMENSION / num / ("(" S* math_expr S* ")") / calc / attr / function
    term = (unary_operator? unit S*) / other_term
    other_term = (STRING S*) / (URI S*) / (IDENT S*) / (hexcolor S*)

    function = IDENT "(" S* expr ")" S*
    hexcolor = ("#" h h h h h h) / ("#" h h h)

    """)


import declaration
import objects
import rule
import selector
from statement import Statement
from stylesheet import MediaQuery, Stylesheet


class CssVisitor(NodeVisitor):
    def visit_program(self, node, body):
        return body[-1]

    def visit_stylesheet(self, node, statements):
        sheet = Stylesheet()
        for stmt in statements:
            if isinstance(stmt, Statement):
                sheet.statements.append(stmt)
            elif isinstance(stmt, MediaQuery):
                sheet.media.append(stmt)
        return sheet

    def visit_stmt(self, stmt, (rule_or_media, )):
        return rule_or_media

    def visit_rule(self, rule, (lhs, rhs)):
        return Statement(lhs, rhs)

    def visit_rule_lhs(self, node, body):
        body = filter(None, body)
        if len(body) == 1:
            return body[0]
        else:
            return selector.MultiSelector(body)

    def visit_more_selector(self, node, body):
        return body[-1]

    def visit_selector(self, node, body):
        ssel = body[0]
        if len(body) == 1:
            return ssel
        combinator, subsel = body[1][0]
        if not subsel:
            return ssel

        if not combinator:
            return selector.DescendantSelector(ssel, subsel)
        elif combinator == '+':
            return selector.AdjacencySelector(ssel, subsel)
        elif combinator == '>':
            return selector.DirectDescendantSelector(ssel, subsel)
        elif combinator == '~':
            return selector.SiblingSelector(ssel, subsel)

        raise Exception('Unrecognized selector')

    def visit_selector_trailer(self, node, (trailer, )):
        return trailer

    def visit_selector_trailer_a(self, node, body):
        return body

    def visit_selector_trailer_b(self, node, body):
        return body[-2:]

    def visit_selector_trailer_c(self, node, body):
        return None, body[-1]

    def visit_selector_trailer_d(self, node, body):
        return None, None

    def visit_simple_selector(self, ssel, body):
        ss = selector.SimpleSelector()
        body = body[0]
        if not isinstance(body[0], (list, tuple)):
            ss.rules.append(body[0])
            if len(body) == 1:
                return ss
            body = body[1]
        for rule in body:
            ss.rules.append(rule)
        return ss

    def visit_element_name(self, el_name, (ident, )):
        return rule.RuleType(ident)

    def visit_element_selector(self, body, (ident, )):
        return body.text

    def visit_wild_element_selector(self, *args):
        return '*'

    def visit_simple_selector_etc(self, node, body):
        return body[0]

    def visit_id_selector(self, node, (_, name)):
        return rule.RuleID(name)

    def visit_class_selector(self, node, (_, name)):
        return rule.RuleClass(name)

    def visit_attrib_selector(self, node, body):
        binop, val = None, None
        if body[3]:
            binop = node.children[3].children[0].children[0].text
            val = body[3][0][2][0]
        return rule.RuleAttribute(body[2], binop, val)

    def visit_rule_rhs(self, node, body):
        return body[1]

    def visit_decls(self, node, (ws, decl, more_decl)):
        return [decl] + more_decl

    def visit_more_declaration(self, node, (sc, ws, decl)):
        return decl

    def visit_declaration(self, node, (name, c, ws, expr, prior)):
        return declaration.Declaration(name[0], expr, bool(prior))

    def visit_prio(self, node, *args):
        return bool(node.text)

    def visit_expr(self, node, (term, more_terms)):
        # TODO: Make this parse into a data structure
        return node.text.strip()

    def visit_STRING(self, node, body):
        return objects.String(u''.join(body[1]))

    def visit_IDENT(self, identifier, (nmstart, nmchar)):
        return identifier.text

    def visit_S(self, *args, **kwargs):
        return None

    def generic_visit(self, node, visited_children):
        return visited_children


if __name__ == '__main__':
    tree = css.parse("""
        p #id .class p.classname#identifier {
            thing: 4em !important;
            thang: 5khz
        }
        [a] [b=c] {color:blue}
        """)

    import pdb; pdb.set_trace()
    #print tree
    visited = CssVisitor().visit(tree)
    print unicode(visited)
    print visited.pretty()
    import pdb; pdb.set_trace()

def do_parse(raw):
    tree = css.parse(raw)
    return CssVisitor().visit(tree)

