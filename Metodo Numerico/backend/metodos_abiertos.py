from sympy import sympify, diff, symbols
import math

"""Métodos abiertos: Secante y Tangente (Newton-Raphson)"""

def resolver_abiertos(expr_str, x1, x2, iteraciones, tolerancia, metodo):
    funcion = sympify(expr_str)
    x = symbols('x')
    derivada = diff(funcion, x)

    def f(valor):
        return float(funcion.subs(x, valor).evalf())

    def derivadaf(valor):
        return float(derivada.subs(x, valor).evalf())

    x3_anterior = 0

    # Evaluaciones iniciales
    fx1 = f(x1)
    fx2 = f(x2)

    if abs(fx1) < tolerancia:
        return {"raiz": x1}

    if metodo == "secante" and abs(fx2) < tolerancia:
        return {"raiz": x2}
    
    #iteraciones
    for i in range(iteraciones):

        if metodo == "secante":
            if fx2 - fx1 == 0:
                return {"error": "División por cero"}

            x3 = (fx2 * x1 - fx1 * x2) / (fx2 - fx1)

        elif metodo == "tangente":
            d = derivadaf(x1)
            if abs(d) < tolerancia:
                return {"error": "Derivada casi cero, diverge"}

            x3 = x1 - f(x1) / d
        else:
            return {"error": "Método inválido"}

        # Cálculo error
        if x3 == 0:
            return {"error": "x3 = 0"}

        error = abs((x3 - x3_anterior) / x3)

        if abs(f(x3)) < tolerancia or error < tolerancia:
            return {"raiz": x3, "iteración": i, "error": error}

        # Actualizar valores
        if metodo == "secante":
            x1, x2 = x2, x3
        else:
            x1 = x3

        x3_anterior = x3

    return {"raiz": x3, "mensaje": "Máximo de iteraciones"}