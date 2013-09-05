
%lex
esc                 "\\"
digit               [0-9]
unary_operator      [\-\+]
ws                  [ \n\r\t\f]
comment             "/*"[^*]*"*"+([^/*][^*]*"*"+)"*/"
hex                 [a-fA-F0-9]
ident               [a-zA-Z_\-][a-zA-Z0-9_\-]*

%%
({ws}|{comment})+                   return 'S'
","                                 return ','
";"                                 return ';'
":"                                 return ':'
","                                 return ','
"{"                                 return '{'
"}"                                 return '}'
"["                                 return '['
"]"                                 return ']'
"("                                 return '('
")"                                 return ')'
"#"                                 return '#'
"%"                                 return '%'
"."                                 return '.'
"*"                                 return '*'
"|"                                 return '|'
"/"                                 return '/'
"*"                                 return '*'
"n"                                 return 'N'
"-"[a-zA-Z]+"-"                     return 'VENDOR_PREFIX'
"@"                                 return 'BLOCK_START'
"@charset"                          return 'BLOCK_CHARSET'
"@import"                           return 'BLOCK_IMPORT'
"@namespace"                        return 'BLOCK_NAMESPACE'
"@media"                            return 'BLOCK_MEDIA'
"@font-face"                        return 'BLOCK_FONT_FACE'
"@page"                             return 'BLOCK_PAGE'
"keyframes"                         return 'BLOCK_KEYFRAMES'
\"(?:{esc}["bfnrt/{esc}]|{esc}"u"{hex}{1,7}{ws}|[^"{esc}])*\"  yytext = yytext.substr(1,yyleng-2); return 'STRING';
\'(?:{esc}['bfnrt/{esc}]|{esc}"u"{hex}{1,7}{ws}|[^'{esc}])*\'  yytext = yytext.substr(1,yyleng-2); return 'STRING';
"only"                              return 'ONLY'
"not"                               return 'NOT'
"and"                               return 'AND'
"from"                              return 'FROM'
"to"                                return 'TO'
"odd"                               return 'ODD'
"even"                              return 'EVEN'
"important"                         return 'IMPORTANT'
"filter"                            return 'IE_FILTER'
"nth-"("last-")?("child"|"of-type") return 'NTH_FUNC'
"url("[^)]+")"                      return 'URL_FULL'
"calc"                              return 'CALC'
"attr"                              return 'ATTR'
{ident}"("                          return 'FUNCTION_IDENT'
{ident}                             return 'IDENT'
[1-9][0-9]*                         return 'INTEGER'
([1-9][0-9]+|[0-9])"."[0-9]+        return 'FLOAT'
[+>~]                               return 'COMBINATOR'
{unary_operator}                    return 'UNARY_OPERATOR'
[,/]                                return 'EXPR_OPERATOR'
[~|^$*]?"="                         return 'ATTRIBUTE_COMPARISON'
"progid:"?[a-zA-Z0-9\.]+"("[a-zA-Z0-9=#, \n\r\t]*")"{ws}*    return 'IE_PROGID'
{hex}                               return 'HEX'
<<EOF>>                             return 'EOF'

/lex

%start file

%%

file
    : junk stylesheet EOF
        { return $2; }
    ;

string_or_ident
    : STRING
        { $$ = $1; }
    | IDENT
        { $$ = $1; }
    ;

string_or_uri
    : STRING
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
    : BLOCK_CHARSET junk STRING junk ';' scc
        { $$ = new yy.Charset($4); }
    |
        { $$ = null; }
    ;

import_list
    : import_list import_block
        { $$ = $1; $$.push($2); }
    /*| import_block
        { $$ = [$1]; }*/
    |
        { $$ = []; }
    ;

import_block
    : BLOCK_IMPORT junk string_or_uri scc
        { $$ = new yy.Import($3, null); }
    : BLOCK_IMPORT junk string_or_uri junk medium_list scc
        { $$ = new yy.Import($3, $5); }
    ;

namespace_list
    : namespace_list namespace_block
        { $$ = $1; $$.push($2); }
    /*| namespace_block
        { $$ = [$1]; }*/
    |
        { $$ = []; }
    ;

namespace_block
    : BLOCK_NAMESPACE junk string_or_uri junk ';' scc
        { $$ = new yy.Namespace($3, null); }
    | BLOCK_NAMESPACE junk IDENT junk string_or_uri junk ';' scc
        { $$ = new yy.Namespace($5, $3); }
    ;

blocks
    : blocks block
        { $$ = $1; $$.push($2); }
    | block
        { $$ = [$1]; }
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
    ;

media_block
    : BLOCK_MEDIA junk medium_list junk '{' media_inner_list '}'
        { $$ = new yy.Media($3, $6); }
    ;

media_inner_list
    : media_inner media_inner_list
        { $$ = $2; $$.unshift($1); }
    | media_inner
        { $$ = [$1]; }
    ;

media_inner
    : media_block
        { $$ = $1; }
    | ruleset
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
    : '(' junk IDENT junk ')'
        { $$ = new yy.MediaExpression($3, null); }
    | '(' junk IDENT junk ':' junk expr ')'
        { $$ = new yy.MediaExpression($3, $6); }
    ;

page_block
    : BLOCK_PAGE junk page_name junk '{' junk declaration_list junk '}'
        { $$ = new yy.Page($3, $7); }
    ;

page_name
    : IDENT ':' IDENT
        { $$ = $1 + ':' + $3; }
    | ':' IDENT
        { $$ = ':' + $3; }
    | IDENT
        { $$ = $1; }
    |
        { $$ = null; }
    ;

font_face_block
    : BLOCK_FONT_FACE junk '{' junk declaration_list junk '}'
        { $$ = new yy.FontFace($6); }
    ;

keyframes_block
    : BLOCK_START BLOCK_KEYFRAMES junk IDENT junk '{' junk keyframe_list '}'
        { $$ = new yy.Keyframes($4, $8); }
    | BLOCK_START vendor_prefix BLOCK_KEYFRAMES junk IDENT junk '{' junk keyframe_list '}'
        { $$ = new yy.Keyframes($5, $9, $2); }
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
    | FROM junk
        { $$ = new yy.KeyframeSelector('from'); }
    | TO junk
        { $$ = new yy.KeyframeSelector('to'); }
    ;


ruleset
    : selector_list junk '{' junk declaration_list junk '}'
        { $$ = new yy.Ruleset($1, $5); }
    ;

selector_list
    : selector_list ',' junk selector_chunk_list
        { $$ = $1; $$.push($4); }
    | selector_chunk_list
        { $$ = [$1]; }
    ;

selector_chunk_list
    : selector_chunk_list COMBINATOR junk simple_selector junk
        { $$ = $1; $$.push([$2, $4]); }
    | simple_selector junk
        { $$ = [[null, $1]]; }
    ;

simple_selector
    : element_name simple_selector_part_list
        { $$ = [$1].concat($2); }
    | simple_selector_part_list
        { $$ = $1; }
    ;

simple_selector_part_list
    : simple_selector_part_list '#' IDENT junk
        { $$ = $1; $$.push(new yy.IDSelector($3)); }
    | simple_selector_part_list '.' IDENT junk
        { $$ = $1; $$.push(new yy.ClassSelector($3)); }
    | simple_selector_part_list attribute_selector junk
        { $$ = $1; $$.push($2); }
    | simple_selector_part_list pseudo_selector junk
        { $$ = $1; $$.push($2); }
    | junk
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
    : '[' junk IDENT junk ']'
        { $$ = new yy.AttributeSelector($3, null, null); }
    | '[' junk IDENT junk ATTRIBUTE_COMPARISON junk string_or_ident junk ']'
        { $$ = new yy.AttributeSelector($3, $5, $7); }
    ;

pseudo_selector
    : '::' IDENT
        { $$ = new yy.PseudoElementSelector($2); }
    | ':' NTH_FUNC '(' junk nth ')'
        { $$ = new yy.NthSelector($2, $5); }
    | ':' NOT '(' junk selector_list junk ')'
        { $$ = new yy.NotSelector($5); }
    | ':' IDENT '(' junk expr junk ')'
        { $$ = new yy.PseudoSelectorFunction($2, $5); }
    | ':' IDENT
        { $$ = new yy.PseudoClass($2); }
    ;

nth
    : n_val UNARY_OPERATOR junk INTEGER junk
        { $$ = new yy.LinearFunction($1, $2, $4); }
    | n_val
        { $$ = new yy.LinearFunction($1, '+', '0'); }
    | ODD junk
        { $$ = 'odd'; }
    | EVEN junk
        { $$ = 'even'; }
    | signed_integer junk
        { $$ = new yy.LinearFunction(null, '+', $1); }
    ;

n_val
    : signed_integer N junk
        { $$ = new yy.NValue($1) }
    | N junk
        { $$ = new yy.NValue('1') }
    ;

declaration_list
    : declaration_list junk declaration
        { $$ = $1; $$.push($2); }
    | declaration
        { $$ = [$1]; }
    ;

declaration
    : declaration_inner junk optional_important optional_semicolon
        { $$ = $1; yy.extend($$, $2); }
    ;

optional_important
    : '!' junk IMPORTANT junk
        { $$ = {important: true}; }
    |
        { $$ = {}; }
    ;

declaration_inner
    : FILTER junk ':' junk ie_filter_blob
        { $$ = new yy.IEFilter($5); }
    | IDENT junk ':' junk expr
        { $$ = new yy.Declaration($1, $5); }
    ;

expr
    : term junk expr_chain
        { $$ = new yy.Expression([[null, $1]].concat($3)); }
    ;

expr_chain
    : expr_chain EXPR_OPERATOR junk term junk
        { $$ = $1; $$.push([$2, $4]); }
    | expr_chain term junk
        { $$ = $1; $$.push([null, $2]); }
    | EXPR_OPERATOR junk term junk
        { $$ = [[$1, $3]]; }
    | term junk
        { $$ = [[null, $1]]; }
    ;

term
    : uri
        { $$ = $1; }
    | unit
        { $$ = $1; }
    | STRING
        { $$ = $1; }
    | IDENT
        { $$ = $1; }
    | hexcolor
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
    | vendor_prefix CALC '(' junk math_expr junk ')'
        { $$ = new yy.Func('calc', $5, $1); }
    | CALC '(' junk math_expr junk ')'
        { $$ = new yy.Func('calc', $5, null); }
    | attr_expression
        { $$ = $1; }
    | FUNCTION_IDENT junk expr junk ')'
        { $$ = new yy.Func($1, $4); }
    ;

unit_dim
    : IDENT
        { $$ = $1; }
    | '%'
        { $$ = $1; }
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
    : math_expr UNARY_OPERATOR junk math_product
        { $$ = $1; $$.push([$3, $5]); }
    | math_product
        { $$ = [[null, $1]]; }
    ;

math_product
    : math_product '*' junk unit junk
        { $$ = $1; $$.push(['*', $4]); }
    | math_product '/' junk num junk
        { $$ = $1; $$.push(['/', $4]); }
    | unit junk
        { $$ = [[null, $1]]; }
    ;

hexcolor
    : '#' hex hex hex hex hex hex
        { $$ = new yy.HexColor('#' + $2 + $3 + $4 + $5 + $6 + $7); }
    | '#' hex hex hex
        { $$ = new yy.HexColor('#' + $2 + $3 + $4); }
    ;

ie_filter_blob
    : ie_filter_blob IE_PROGID
        { $$ = $1 + $3; }
    | IE_PROGID
        { $$ = $1; }
    ;

signed_integer
    : UNARY_OPERATOR INTEGER
        { $$ = new yy.Integer($2, $1); }
    | INTEGER
        { $$ = new yy.Integer($1, '+'); }
    ;

num
    : signed_integer
        { $$ = $1; }
    | UNARY_OPERATOR FLOAT
        { $$ = new yy.Float($2, $1); }
    | FLOAT
        { $$ = new yy.Float($1, '+'); }
    ;

optional_semicolon
    : ';'
        { $$ = null; }
    |
        { $$ = null; }
    ;

