from sympy import sympify

"""Métodos cerrados: Bisección y Regla Falsa"""

def resolver_cerrados(expr_str, x1, x2, iteraciones, tolerancia, metodo):
    funcion = sympify(expr_str)

    def f(v):
        return float(funcion.subs('x', v).evalf())
    
    # Evaluaciones iniciales
    fx1 = f(x1)
    fx2 = f(x2)

    # Validación del intervalo
    if fx1 * fx2 > 0:
        return {"error": "La raíz NO está en el intervalo (x1*f(x1) y x2*f(x2) tienen igual signo)"}

    if fx1 == 0:
        return {"raiz": x1, "mensaje": "x1 es raíz exacta"}

    if fx2 == 0:
        return {"raiz": x2, "mensaje": "x2 es raíz exacta"}

    x3_anterior = 0

    for i in range(iteraciones):

        # Cálculo de x3
        if metodo == "biseccion":
            x3 = (x1 + x2) / 2

        elif metodo == "regla_falsa":
            fx1 = f(x1)
            fx2 = f(x2)

            if fx2 - fx1 == 0:
                return {"error": "División por cero en Regla Falsa"}

            x3 = (fx2 * x1 - fx1 * x2) / (fx2 - fx1)

        else:
            return {"error": "Método inválido. Usa 'biseccion' o 'regla_falsa'."}

        fx3 = f(x3)

        # Error
        if x3 == 0:
            return {"error": "x3 = 0 genera división en error"}

        error = abs((x3 - x3_anterior) / x3)

        if abs(fx3) < tolerancia or error < tolerancia:
            return {
                "raiz": x3,
                "iteracion": i,
                "error": error
            }

        # Actualizar intervalo
        if fx1 * fx3 < 0:
            x2 = x3
            fx2 = fx3
        else:
            x1 = x3
            fx1 = fx3

        x3_anterior = x3

    # Alcanzo límite
    return {
        "raiz": x3,
        "mensaje": "Se alcanzó el máximo de iteraciones",
        "error": error
    }