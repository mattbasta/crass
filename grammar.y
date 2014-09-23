// CSS grammar based on CSS3 specification
// Written by Matt Basta
// Copyright 2013


%lex
esc                 "\\"
unary_operator      [\-\+]
ws                  [ \n\r\t\f]
comment             "/*"(.|\n|\r)*?"*/"
hex                 [a-fA-F0-9]
ident               ([a-zA-Z_]|"-"[a-zA-Z\-]+)[a-zA-Z0-9_\-]*
int                 ([1-9][0-9]*|"0")
ie_junk             [a-zA-Z0-9=#, \n\r\t'"]
ie_ident            [a-zA-Z0-9\.:]

%%
"#"{hex}{hex}{hex}{hex}{hex}{hex}   return 'HEX_LONG'
"#"{hex}{hex}{hex}                  return 'HEX_SHORT'
{int}?"."[0-9]+                     return 'FLOAT'
{int}                               return 'INTEGER'
({ws}|{comment})+                   return 'S'
","                                 return ','
";"                                 return ';'
","                                 return ','
"{"                                 return '{'
"}"                                 return '}'
"["                                 return '['
"]"                                 return ']'
"("                                 return '('
")"                                 return ')'
"%"                                 return '%'
"*"                                 return '*'
"|"                                 return '|'
"/"                                 return '/'
"*"                                 return '*'
"="                                 return '='
"n-resize"                          return 'IDENT'  // For cursor: n-resize
"not-allowed"                       return 'IDENT'  // For cursor: not-allowed
"n"                                 return 'N'
"@charset"                          return 'BLOCK_CHARSET'
"@import"                           return 'BLOCK_IMPORT'
"@namespace"                        return 'BLOCK_NAMESPACE'
"@media"                            return 'BLOCK_MEDIA'
"@font-face"                        return 'BLOCK_FONT_FACE'
"@page"                             return 'BLOCK_PAGE'
"@keyframes"                        return 'BLOCK_KEYFRAMES'
"@-"[a-zA-Z]+"-keyframes"           return 'BLOCK_VENDOR_KEYFRAMES'
"@-viewport"                        return 'BLOCK_VIEWPORT'
"@-"[a-zA-Z]+"-viewport"            return 'BLOCK_VENDOR_VIEWPORT'
"@supports"                         return 'BLOCK_SUPPORTS'
"@top-left-corner"                  return 'PAGE_TOP_LEFT_CORNER'
"@top-left"                         return 'PAGE_TOP_LEFT'
"@top-center"                       return 'PAGE_TOP_CENTER'
"@top-right"                        return 'PAGE_TOP_RIGHT'
"@top-right-corner"                 return 'PAGE_TOP_RIGHT_CORNER'
"@bottom-left-corner"               return 'PAGE_BOTTOM_LEFT_CORNER'
"@bottom-left"                      return 'PAGE_BOTTOM_LEFT'
"@bottom-center"                    return 'PAGE_BOTTOM_CENTER'
"@bottom-right"                     return 'PAGE_BOTTOM_RIGHT'
"@bottom-right-corner"              return 'PAGE_BOTTOM_RIGHT_CORNER'
"@left-top"                         return 'PAGE_LEFT_TOP'
"@left-middle"                      return 'PAGE_LEFT_MIDDLE'
"@left-bottom"                      return 'PAGE_LEFT_BOTTOM'
"@right-top"                        return 'PAGE_RIGHT_TOP'
"@right-middle"                     return 'PAGE_RIGHT_MIDDLE'
"@right-bottom"                     return 'PAGE_RIGHT_BOTTOM'

\"(?:\\(?:.|{ws})|[^"\\])*\"     yytext = yytext.substr(1,yyleng-2); return 'STRING';
\'(?:\\(?:.|{ws})|[^'\\])*\'     yytext = yytext.substr(1,yyleng-2); return 'STRING';
"only"                              return 'ONLY'
"not"                               return 'NOT'
"and"                               return 'AND'
"or"                                return 'OR'
"odd"                               return 'ODD'
"even"                              return 'EVEN'
"!"                                 return '!'
"important"                         return 'IMPORTANT'
"expression(".*?")"                 return 'IE_EXPRESSION'
"filter"{ws}*":"{ws}*({ie_ident}+"("{ie_junk}*")"{ws}*)+  return 'IE_FILTER'
"-ms-filter"{ws}*":"{ws}*({ie_ident}+"("{ie_junk}*")"{ws}*)+  return 'IE_FILTER'
"url("[^)]*")"                      return 'URL_FULL'
"calc"                              return 'CALC'
"attr"                              return 'ATTR'
"#"{ident}                          return 'ID_IDENT'
"."{ident}                          return 'CLASS_IDENT'
{ident}"("                          return 'FUNCTION_IDENT'
"from"                              return 'FROM'
"to"                                return 'TO'
{ident}                             return 'IDENT'
"$"                                 return '$'
"^"                                 return '^'
"-"                                 return '-'
"+"                                 return '+'
">"                                 return 'SEL_CHILD'
"~"                                 return 'SEL_SIBLING'
":nth-"("last-")?("child"|"of-type") return 'NTH_FUNC'
":only-child"                       return 'PSEUDO_CLASS'
":only-of-type"                     return 'PSEUDO_CLASS'
"::"                                return '::'
":"                                 return ':'
"\\9"                               return 'SLASH_NINE'
<<EOF>>                             return 'EOF'

/lex

%start file

%%

file
    : junk stylesheet EOF
        { return $2; }
    ;

string
    : STRING
        { $$ = new yy.String($1); }
    ;

string_or_ident
    : string
        { $$ = $1; }
    | IDENT
        { $$ = $1; }
    ;

string_or_uri
    : string
        { $$ = $1; }
    | uri
        { $$ = $1; }
    ;

junk
    :
        { $$ = null; }
    | S
        { $$ = null; }
    ;

scc
    :
        { $$ = null; }
    | S
        { $$ = null; }
    | HTML_COMMENT
        { $$ = null; }
    ;

stylesheet
    : charset_block import_list namespace_list blocks
        { $$ = new yy.Stylesheet($1, $2, $3, $4); }
    ;

charset_block
    : BLOCK_CHARSET junk string junk ';' scc
        { $$ = new yy.Charset($3); }
    |
        { $$ = null; }
    ;

import_list
    : import_block ';' scc import_list
        { $$ = $4; $$.unshift($1); }
    |
        { $$ = []; }
    ;

import_block
    : BLOCK_IMPORT junk string_or_uri junk
        { $$ = new yy.Import($3, null); }
    | BLOCK_IMPORT junk string_or_uri junk medium_list junk
        { $$ = new yy.Import($3, $5); }
    ;

namespace_list
    : namespace_block ';' scc namespace_list
        { $$ = $4; $$.unshift($1); }
    |
        { $$ = []; }
    ;

namespace_block
    : BLOCK_NAMESPACE junk string junk
        { $$ = new yy.Namespace($3, null); }
    | BLOCK_NAMESPACE junk IDENT junk string junk
        { $$ = new yy.Namespace($5, $3); }
    ;

blocks
    : blocks block
        { $$ = $1; $$.push($2); }
    | block
        { $$ = [$1]; }
    |
        { $$ = []; }
    ;

block
    : ruleset scc
        { $$ = $1; }
    | media_block scc
        { $$ = $1; }
    | page_block scc
        { $$ = $1; }
    | font_face_block scc
        { $$ = $1; }
    | keyframes_block scc
        { $$ = $1; }
    | viewport_block scc
        { $$ = $1; }
    | supports_block scc
        { $$ = $1; }
    ;

media_block
    : BLOCK_MEDIA junk medium_list junk '{' junk media_inner_list '}'
        { $$ = new yy.Media($3, $7); }
    ;

media_inner_list
    : media_inner media_inner_list
        { $$ = $2; $$.unshift($1); }
    | media_inner
        { $$ = [$1]; }
    ;

media_inner
    : media_block scc
        { $$ = $1; }
    | ruleset scc
        { $$ = $1; }
    ;

medium_list
    : medium_list junk ',' junk media_query
        { $$ = $1; $$.push($5); }
    | media_query
        { $$ = [$1]; }
    ;

media_query
    : media_query_type
        { $$ = $1; }
    | media_query_expr
        { $$ = new yy.MediaQuery(null, null, $1); }
    ;

media_query_type
    : ONLY junk IDENT junk optional_media_query_expression
        { $$ = new yy.MediaQuery($3, 'only', $5); }
    | NOT junk IDENT junk optional_media_query_expression
        { $$ = new yy.MediaQuery($3, 'not', $5); }
    | IDENT junk optional_media_query_expression
        { $$ = new yy.MediaQuery($1, null, $3); }
    ;

optional_media_query_expression
    : AND junk media_query_expr
        { $$ = $3; }
    |
        { $$ = null; }
    ;

media_query_expr
    : media_query_expr AND junk media_expr
        { $$ = $1; $$.push($4); }
    | media_expr
        { $$ = [$1]; }
    ;

media_expr
    : '(' junk IDENT junk ':' junk expr ')' junk
        { $$ = new yy.MediaExpression($3, $7); }
    | '(' junk IDENT junk ')' junk
        { $$ = new yy.MediaExpression($3, null); }
    ;

page_block
    : BLOCK_PAGE junk page_name junk '{' junk page_declaration_list junk '}'
        { $$ = new yy.Page($3, $7); }
    ;

page_name
    : IDENT ':' IDENT
        { $$ = $1 + ':' + $3; }
    | ':' IDENT
        { $$ = ':' + $2; }
    | IDENT
        { $$ = $1; }
    |
        { $$ = null; }
    ;

page_declaration_list
    : page_declaration_list junk declaration
        { $$ = $1; $$.push($3); }
    | page_declaration_list junk page_margin_declaration
        { $$ = $1; $$.push($3); }
    | page_declaration_list junk ';'
        { $$ = $1; }
    | page_declaration_list junk
        { $$ = $1; }
    |
        { $$ = []; }
    ;

page_margin_declaration
    : page_margin junk '{' junk declaration_list junk '}'
        { $$ = new yy.PageMargin($1.substr(1), $5); }
    ;

page_margin
    : PAGE_TOP_LEFT_CORNER
        { $$ = $1; }
    | PAGE_TOP_LEFT
        { $$ = $1; }
    | PAGE_TOP_CENTER
        { $$ = $1; }
    | PAGE_TOP_RIGHT
        { $$ = $1; }
    | PAGE_TOP_RIGHT_CORNER
        { $$ = $1; }
    | PAGE_BOTTOM_LEFT_CORNER
        { $$ = $1; }
    | PAGE_BOTTOM_LEFT
        { $$ = $1; }
    | PAGE_BOTTOM_CENTER
        { $$ = $1; }
    | PAGE_BOTTOM_RIGHT
        { $$ = $1; }
    | PAGE_BOTTOM_RIGHT_CORNER
        { $$ = $1; }
    | PAGE_LEFT_TOP
        { $$ = $1; }
    | PAGE_LEFT_MIDDLE
        { $$ = $1; }
    | PAGE_LEFT_BOTTOM
        { $$ = $1; }
    | PAGE_RIGHT_TOP
        { $$ = $1; }
    | PAGE_RIGHT_MIDDLE
        { $$ = $1; }
    | PAGE_RIGHT_BOTTOM
        { $$ = $1; }
    ;

font_face_block
    : BLOCK_FONT_FACE junk '{' junk declaration_list junk '}'
        { $$ = new yy.FontFace($5); }
    ;

keyframes_block
    : BLOCK_KEYFRAMES junk IDENT junk '{' junk keyframe_list '}'
        { $$ = new yy.Keyframes($3, $7); }
    | BLOCK_VENDOR_KEYFRAMES junk IDENT junk '{' junk keyframe_list '}'
        { $$ = new yy.Keyframes($3, $7, $1.substring(1, $1.length - 9)); }
    ;

keyframe_list
    : keyframe_list keyframe
        { $$ = $1; $$.push($2); }
    | keyframe
        { $$ = [$1]; }
    ;

keyframe
    : keyframe_selector_list '{' junk declaration_list junk '}' junk
        { $$ = new yy.Keyframe($1, $4); }
    ;

keyframe_selector_list
    : keyframe_selector_list ',' junk keyframe_selector
        { $$ = $1; $$.push($4); }
    | keyframe_selector
        { $$ = [$1]; }
    ;

keyframe_selector
    : num '%' junk
        { $$ = new yy.KeyframeSelector($1 + '%'); }
    | num junk
        {
            if ($1.asNumber() !== 0) throw new SyntaxError('Invalid keyframe selector: ' + $1.toString());
            $$ = new yy.KeyframeSelector($1.toString());
        }
    | FROM junk
        { $$ = new yy.KeyframeSelector('from'); }
    | TO junk
        { $$ = new yy.KeyframeSelector('to'); }
    ;

viewport_block
    : BLOCK_VIEWPORT junk '{' junk declaration_list '}'
        { $$ = new yy.Viewport($5); }
    | BLOCK_VENDOR_VIEWPORT junk '{' junk declaration_list '}'
        { $$ = new yy.Viewport($5, $1.substring(1, $1.length - 8)); }
    ;


supports_block
    : BLOCK_SUPPORTS junk supports_list junk '{' junk blocks '}'
        { $$ = new yy.Supports($3, $7); }
    ;

supports_list
    : supports_item OR junk supports_list
        { $$ = yy.createSupportsConditionList($1, 'or', $4); }
    | supports_item AND junk supports_list
        { $$ = yy.createSupportsConditionList($1, 'and', $4); }
    | supports_item
        { $$ = $1; }
    ;

supports_item
    : supports_negation
        { $$ = $1; }
    | '(' junk declaration junk ')' junk
        { $$ = new yy.SupportsCondition($3); }
    | '(' junk supports_list junk ')' junk
        { $$ = $3; }
    ;

supports_negation
    : NOT junk '(' junk supports_list junk ')' junk
        { $$ = new yy.SupportsCondition($5); $$.negate(); }
    | NOT junk '(' junk declaration junk ')' junk
        { $$ = new yy.SupportsCondition($5); $$.negate(); }
    | NOT junk '(' junk supports_negation junk ')' junk
        { $$ = new yy.SupportsCondition($5); $$.negate(); }
    ;


ruleset
    : selector_list junk '{' junk declaration_list junk '}'
        { $$ = new yy.Ruleset($1, $5); }
    ;

selector_list
    : selector_list ',' junk selector_chunk_list
        { $$ = yy.createSelectorList($1, $4); }
    | selector_chunk_list
        { $$ = $1; }
    ;

selector_chunk_list
    : selector_chunk_list '+' junk simple_selector junk
        { $$ = new yy.AdjacentSelector($1, $4); }
    | selector_chunk_list SEL_CHILD junk simple_selector junk
        { $$ = new yy.DirectDescendantSelector($1, $4); }
    | selector_chunk_list SEL_SIBLING junk simple_selector junk
        { $$ = new yy.SiblingSelector($1, $4); }
    | selector_chunk_list simple_selector junk
        { $$ = new yy.DescendantSelector($1, $2); }
    | simple_selector junk
        { $$ = $1; }
    ;

simple_selector
    : element_name simple_selector_part_list
        { $$ = new yy.SimpleSelector([$1].concat($2)); }
    | simple_selector_part_list
        { $$ = new yy.SimpleSelector($1); }
    ;

simple_selector_part_list
    : simple_selector_part_list ID_IDENT
        { $$ = $1; $$.push(new yy.IDSelector($2.substr(1))); }
    /* FIXME: These next four rules are an abomination. */
    | simple_selector_part_list HEX_SHORT
        { $$ = $1; $$.push(new yy.IDSelector($2.substr(1))); }
    | simple_selector_part_list HEX_SHORT IDENT
        { $$ = $1; $$.push(new yy.IDSelector($2.substr(1) + $3)); }
    | simple_selector_part_list HEX_LONG
        { $$ = $1; $$.push(new yy.IDSelector($2.substr(1))); }
    | simple_selector_part_list HEX_LONG IDENT
        { $$ = $1; $$.push(new yy.IDSelector($2.substr(1) + $3)); }
    /* </abomination> */
    | simple_selector_part_list CLASS_IDENT
        { $$ = $1; $$.push(new yy.ClassSelector($2.substr(1))); }
    | simple_selector_part_list attribute_selector
        { $$ = $1; $$.push($2); }
    | simple_selector_part_list pseudo_selector
        { $$ = $1; $$.push($2); }
    |
        { $$ = []; }
    ;

element_name
    : element_type '|' IDENT
        { $$ = new yy.ElementSelector($1, $3); }
    | element_type
        { $$ = new yy.ElementSelector($1, null); }
    | '|' IDENT
        { $$ = new yy.ElementSelector(null, $2); }
    ;

element_type
    : IDENT
        { $$ = $1; }
    | '*'
        { $$ = $1; }
    ;

attribute_selector
    : '[' junk element_name junk ']'
        { $$ = new yy.AttributeSelector($3, null, null); }
    | '[' junk element_name junk '=' junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5, $7); }
    | '[' junk element_name junk '*' '=' junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5 + $6, $8); }
    | '[' junk element_name junk '|' '=' junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5 + $6, $8); }
    | '[' junk element_name junk '^' '=' junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5 + $6, $8); }
    | '[' junk element_name junk '$' '=' junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5 + $6, $8); }
    | '[' junk element_name junk SEL_SIBLING '=' junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5 + $6, $8); }
    ;

pseudo_selector
    : '::' IDENT
        { $$ = new yy.PseudoElementSelector($2); }
    | NTH_FUNC '(' junk nth ')'
        { $$ = new yy.NthSelector($1.substr(1), $4); }
    | ':' NOT '(' junk selector_list junk ')'
        { $$ = new yy.NotSelector($5); }
    | ':' FUNCTION_IDENT junk expr junk ')'
        { $$ = new yy.PseudoSelectorFunction($2.substring(0, $2.length - 1), $4); }
    | PSEUDO_CLASS
        { $$ = new yy.PseudoClassSelector($1.substr(1)); }
    | ':' IDENT
        { $$ = new yy.PseudoClassSelector($2); }
    ;

nth
    : n_val '+' junk integer junk
        { $4.applySign($2); $$ = new yy.LinearFunction($1, $4); }
    | n_val '-' junk integer junk
        { $4.applySign($2); $$ = new yy.LinearFunction($1, $4); }
    | n_val
        { $$ = $1; }
    | ODD junk
        { $$ = 'odd'; }
    | EVEN junk
        { $$ = 'even'; }
    | signed_integer junk
        { $$ = new yy.LinearFunction(null, $1); }
    ;

n_val
    : signed_integer N junk
        { $$ = new yy.NValue($1) }
    | N junk
        { $$ = new yy.NValue(1) }
    ;

declaration_list
    : declaration_list junk ';' junk declaration
        { $$ = $1; $$.push($5); }
    | declaration_list junk ';' junk
        { $$ = $1; }
    | declaration
        { $$ = [$1]; }
    |
        { $$ = []; }
    ;

declaration
    : declaration_inner junk optional_important optional_slash_nine
        { $$ = $1; yy.extend($$, $3); yy.extend($$, $4); }
    ;

optional_important
    : '!' junk IMPORTANT junk
        { $$ = {important: true}; }
    |
        { $$ = {}; }
    ;

optional_slash_nine
    : SLASH_NINE junk
        { $$ = {slash_nine: true}; }
    |
        { $$ = {}; }
    ;

declaration_inner
    : IE_FILTER
        { $$ = new yy.IEFilter($1); }
    | '*' IDENT junk ':' junk expr
        { $$ = new yy.Declaration('*' + $2, $6); }
    | IDENT junk ':' junk expr
        { $$ = new yy.Declaration($1, $5); }
    ;

expr
    : term junk expr_chain
        { $$ = new yy.Expression([[null, $1]].concat($3)); }
    ;

expr_chain
    : expr_chain ',' junk term junk
        { $$ = $1; $$.push([$2, $4]); }
    | expr_chain '/' junk term junk
        { $$ = $1; $$.push([$2, $4]); }
    | expr_chain term junk
        { $$ = $1; $$.push([null, $2]); }
    | ',' junk term junk
        { $$ = [[$1, $3]]; }
    | '/' junk term junk
        { $$ = [[$1, $3]]; }
    | term junk
        { $$ = [[null, $1]]; }
    |
        { $$ = []; }
    ;

term
    : uri
        { $$ = $1; }
    | unit
        { $$ = $1; }
    | string
        { $$ = $1; }
    | IDENT
        { $$ = $1; }
    | hexcolor
        { $$ = $1; }
    | TO
        { $$ = $1; }
    | FROM
        { $$ = $1; }
    | IE_EXPRESSION
        { $$ = $1; }
    ;

uri
    : URL_FULL
        { $$ = new yy.URI($1.substr(4, $1.length - 5)); }
    ;

unit
    : num unit_dim
        { $$ = new yy.Dimension($1, $2); }
    | '(' junk math_expr junk ')'
        { $$ = $3; }
    | CALC '(' junk math_expr junk ')'
        { $$ = new yy.Func('calc', $4, null); }
    | attr_expression
        { $$ = $1; }
    | function
        { $$ = $1; }
    ;

function
    : FUNCTION_IDENT junk expr junk ')'
        { $$ = new yy.Func($1.substr(0, $1.length - 1), $3); }
    ;

unit_dim
    : IDENT
        { $$ = $1; }
    | '%'
        { $$ = '%'; }
    |
        { $$ = null; }
    ;


attr_expression
    : ATTR '(' junk element_name junk IDENT junk ',' junk unit junk ')'
        { $$ = new yy.Func('attr', [$4, $6, $10]);}
    | ATTR '(' junk element_name junk IDENT junk  ')'
        { $$ = new yy.Func('attr', [$4, $6]);}
    | ATTR '(' junk element_name junk ')'
        { $$ = new yy.Func('attr', [$4]);}
    ;

math_expr
    : math_expr '+' junk math_product
        { $$ = new yy.MathSum($1, $2, $4); }
    | math_expr '-' junk math_product
        { $$ = new yy.MathSum($1, $2, $4); }
    | math_product
        { $$ = $1; }
    ;

math_product
    : math_product '*' junk unit junk
        { $$ = new yy.MathProduct($1, $2, $4); }
    | math_product '/' junk num junk
        { $$ = new yy.MathProduct($1, $2, $4); }
    | unit junk
        { $$ = $1; }
    ;

hexcolor
    : HEX_SHORT
        { $$ = new yy.HexColor($1); }
    | HEX_LONG
        { $$ = new yy.HexColor($1); }
    ;

signed_integer
    : '+' integer
        { $$ = $2; $$.applySign($1); }
    | '-' integer
        { $$ = $2; $$.applySign($1); }
    | integer
        { $$ = $1; }
    ;

integer
    : INTEGER
        { $$ = new yy.Number($1); }
    ;

num
    : signed_integer
        { $$ = $1; }
    | '+' FLOAT
        { $$ = new yy.Number($2); $$.applySign($1); }
    | '-' FLOAT
        { $$ = new yy.Number($2); $$.applySign($1); }
    | FLOAT
        { $$ = new yy.Number($1); }
    ;
