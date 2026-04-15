from sympy import diff, symbols
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application
)
from expresiones import contexto_sympy, normalizar_expresion

def resolver_abiertos(expr_str, x1, x2, iteraciones, tolerancia, metodo):

    transformations = standard_transformations + (implicit_multiplication_application,)
    expr_str = normalizar_expresion(expr_str)

    x = symbols('x')
    funcion = parse_expr(expr_str, transformations=transformations, local_dict=contexto_sympy(x))
    derivada = diff(funcion, x)

    def f(valor):
        return float(funcion.subs(x, valor).evalf())

    def derivadaf(valor):
        return float(derivada.subs(x, valor).evalf())

    x3 = x1
    error = 0

    fx1 = f(x1)
    fx2 = f(x2)

    if metodo == "secante" and fx1 * fx2 > 0:
        return {"raiz": None, "iteracion": None, "error": "Intervalo inválido"}

    if abs(fx1) < tolerancia:
        return {"raiz": x1, "iteracion": 0, "error": 0}

    if metodo == "secante" and abs(fx2) < tolerancia:
        return {"raiz": x2, "iteracion": 0, "error": 0}

    for i in range(iteraciones):
        aproximacion_anterior = x2 if metodo == "secante" else x1

        if metodo == "secante":
            if fx2 - fx1 == 0:
                return {"raiz": None, "iteracion": None, "error": "División por cero"}

            x3 = (fx2 * x1 - fx1 * x2) / (fx2 - fx1)

        elif metodo == "tangente":
            d = derivadaf(x1)
            if abs(d) < tolerancia:
                return {"raiz": None, "iteracion": None, "error": "Derivada casi cero"}

            x3 = x1 - f(x1) / d

        else:
            return {"raiz": None, "iteracion": None, "error": "Método inválido"}

        if x3 == 0:
            error = abs(x3 - aproximacion_anterior)
        else:
            error = abs((x3 - aproximacion_anterior) / x3)

        if abs(f(x3)) < tolerancia or error < tolerancia:
            return {"raiz": x3, "iteracion": i + 1, "error": error}

        if metodo == "secante":
            x1, x2 = x2, x3
            fx1, fx2 = fx2, f(x3)
        else:
            x1 = x3

    return {"raiz": x3, "iteracion": iteraciones, "error": error}
