from sympy import symbols
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application
)

def resolver_cerrados(expr_str, x1, x2, iteraciones, tolerancia, metodo):

    transformations = standard_transformations + (implicit_multiplication_application,)
    expr_str = expr_str.replace("^", "**")

    x = symbols('x')
    funcion = parse_expr(expr_str, transformations=transformations, local_dict={'x': x})

    def f(v):
        return float(funcion.subs(x, v).evalf())

    fx1 = f(x1)
    fx2 = f(x2)

    if fx1 * fx2 > 0:
        return {"raiz": None, "iteracion": None, "error": "Intervalo inválido"}

    if fx1 == 0:
        return {"raiz": x1, "iteracion": 0, "error": 0}

    if fx2 == 0:
        return {"raiz": x2, "iteracion": 0, "error": 0}

    x3_anterior = 0
    x3 = x1
    error = 0

    for i in range(iteraciones):

        if metodo == "biseccion":
            x3 = (x1 + x2) / 2

        elif metodo == "regla_falsa":
            if fx2 - fx1 == 0:
                return {"raiz": None, "iteracion": None, "error": "División por cero"}

            x3 = (fx2 * x1 - fx1 * x2) / (fx2 - fx1)

        else:
            return {"raiz": None, "iteracion": None, "error": "Método inválido"}

        fx3 = f(x3)

        if x3 == 0:
            error = abs(x3 - x3_anterior)
        else:
            error = abs((x3 - x3_anterior) / x3)

        if abs(fx3) < tolerancia or error < tolerancia:
            return {"raiz": x3, "iteracion": i, "error": error}

        if fx1 * fx3 < 0:
            x2 = x3
            fx2 = fx3
        else:
            x1 = x3
            fx1 = fx3

        x3_anterior = x3

    return {"raiz": x3, "iteracion": iteraciones, "error": error}