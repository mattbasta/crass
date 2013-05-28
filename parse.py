from parsimonious import Grammar
from parsimonious.nodes import NodeVisitor


# Adapted from https://raw.github.com/bhyde/css-parser/master/css.peg:
# This is an incredibly inefficient grammar, but it would be simple to
# optimize. Eventually, Parsimonious will know how to do that automatically.
css = Grammar(r"""
    program = S* stylesheet
    digit = ~"[0123456789]"
    nmstart = ~"[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_]"
    nmchar = nmstart / ~"[0123456789-]"
    minus = "-"
    IDENT = nmstart nmchar*
    NUMBER = digit+ / (digit* "." digit+)
    ws = ~r"[ \t]"
    nl = ~r"[\n]"
    comment = "/*" (!"*/" ~".")* "*/"
    ws_or_nl = ws / nl
    S = ws_or_nl / comment
    stylesheet = stmt*
    stmt = rule / media
    rule = rule_lhs rule_rhs
    rule_lhs = selector more_selector*
    more_selector = "," S* selector
    rule_rhs = "{" decls  ";"? S* "}" S*
    decls = S* declaration more_declaration*
    more_declaration = ";" S* declaration

    selector = simple_selector selector_trailer?
    selector_trailer = selector_trailer_a / selector_trailer_b / selector_trailer_c / selector_trailer_d
    selector_trailer_a = combinator selector
    selector_trailer_b = S+ combinator selector
    selector_trailer_c = S+ selector
    selector_trailer_d = S+

    simple_selector = (element_name simple_selector_etc*) / (simple_selector_etc+)
    simple_selector_etc = id_selector / class_selector / attrib_selector / pseudo_selector

    element_name = element_selector / wild_element_selector
    element_selector = IDENT
    wild_element_selector = "*"

    id_selector     = "#" IDENT
    class_selector  = "." IDENT
    attrib_selector = "[" S* IDENT ( ("=" / "~=" / "|=" / "^=" / "$=" / "*=") S* ( IDENT / STRING ) S*)? "]"
    pseudo_selector = ":" IDENT
    tbd_pseudo_selector = ":" IDENT ( "(" ( IDENT S* )? ")" )?

    combinator = ("+" / ">" / "~") S*

    declaration = property ":" S* expr prio?
    property = IDENT S*
    prio = "!important" S*
    expr = term ( operator? term )*
    operator = operator_a S*
    operator_a =  "/" / ","
    term = (unary_op measure) / measure / other_term
    unary_op = "-" / "+"
    measure = mess S*
    mess = em_m / ex_m / px_m / cm_m / mm_m / in_m / pt_m / pc_m / deg_m / rad_m / grad_m / ms_m / s_m / hx_m / khz_m / precent_m / dim_m / raw_m
    em_m = NUMBER "em"
    ex_m = NUMBER "ex"
    px_m = NUMBER "px"
    cm_m = NUMBER "cm"
    mm_m = NUMBER "mm"
    in_m = NUMBER "in"
    pt_m = NUMBER "pt"
    pc_m = NUMBER "pc"
    deg_m = NUMBER "deg"
    rad_m = NUMBER "rad"
    grad_m = NUMBER "grad"
    ms_m = NUMBER "ms"
    s_m = NUMBER "s"
    hx_m = NUMBER "hz"
    khz_m = NUMBER "khz"
    precent_m = NUMBER "%"
    dim_m = NUMBER IDENT
    raw_m = NUMBER

    other_term = (STRING S*) / (URI S*) / (IDENT S*) / (hexcolor S*) / function

    function = IDENT "(" S* expr ")" S*
    STRING = '"' ( !'"' ~"." )* '"'
    stringchar = urlchar / " " / ("\\" nl)
    urlchar = ~r"[\u0009\u0021\u0023-\u0026\u0027-\u007e]" / nonascii / escape
    nonascii = ~r"[\u0080-\ud7ff\ue000-\ufffd\u10000-\u10ffff]"
    escape = unicode / ("\\" ~r"[\u0020-\u007E\u0080-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]")
    unicode = "\\" ~r"[0-9a-fA-F]{1,6}" wc?
    w = wc*
    wc = "\u0009" / "\u000a" / "\u000C" / "\u000D" / "\u0020"
    nl = "\n" / "\r\n" / "\r" / "\f"
    URI = "url(" w (STRING / urlchar*) w ")"
    hexcolor = ("#" hex hex hex hex hex hex) / ("#" hex hex hex)
    hex = ~r"[0123456789abcdefABCDEF]"


    medium = IDENT S*
    medium_list = medium ("," S* medium)*
    media = "@media" S* medium "{" S* stylesheet "}"
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


tree = css.parse("""
    p #id .class p.classname#identifier {
        thing: 4em !important;
        thang: 5khz
    }
    [a] [b=c] {color:blue}
    """)

#print tree
visited = CssVisitor().visit(tree)
print unicode(visited)
print visited.pretty()
import pdb; pdb.set_trace()
