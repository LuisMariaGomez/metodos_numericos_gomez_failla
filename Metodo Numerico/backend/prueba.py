from sympy import sympify, sin

expr_str = 'sin(x)'
valor_x = 2
expr = sympify(expr_str)
expr_simbolica = expr.subs('x', valor_x)
print(expr_simbolica)
print(expr_simbolica.evalf())