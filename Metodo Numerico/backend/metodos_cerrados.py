from sympy import symbols
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application
)
from expresiones import contexto_sympy, normalizar_expresion

def resolver_cerrados(expr_str, x1, x2, iteraciones, tolerancia, metodo):
    # prepara la expresion para SymPy: (todo esta en el otro archivo de expresiones porque aca hace ruido)
    # convierte ^ en ** y reemplaza |...| por Abs(...)
    transformations = standard_transformations + (implicit_multiplication_application,)
    expr_str = normalizar_expresion(expr_str)

    # crea la variable x y arma la funcion con lo que se manda por el front
    x = symbols('x')
    funcion = parse_expr(expr_str, transformations=transformations, local_dict=contexto_sympy(x))

    def f(v):
        return float(funcion.subs(x, v).evalf())

    # evalua la funcion en los valores iniciales
    fx1 = f(x1)
    fx2 = f(x2)

    # aca se fija que x1 y x2 encierren una raiz, sino chau, el intervalo no sirve
    if fx1 * fx2 > 0:
        return {"raiz": None, "iteracion": None, "error": "Intervalo inválido"}

    # si alguno de los puntos iniciales ya es raiz, no hace falta iterar, ya le mandamos que es raiz
    if fx1 == 0:
        return {"raiz": x1, "iteracion": 0, "error": 0}

    if fx2 == 0:
        return {"raiz": x2, "iteracion": 0, "error": 0}

    x3 = x1
    error = 0

    for i in range(iteraciones):
        # guarda la aproximacion previa para calcular el error relativo
        aproximacion_anterior = x3 if i > 0 else x1

        if metodo == "biseccion":
            # en biseccion agarra el punto del medio del intervalo actual
            x3 = (x1 + x2) / 2

        elif metodo == "regla_falsa":
            # en regla falsa usa la recta que pasa por los dos extremos del intervalo
            if fx2 - fx1 == 0:
                return {"raiz": None, "iteracion": None, "error": "División por cero"}

            x3 = (fx2 * x1 - fx1 * x2) / (fx2 - fx1)

        else:
            return {"raiz": None, "iteracion": None, "error": "Método inválido"}

        fx3 = f(x3)

        # error relativo aproximado entre la iteracion actual y la anterior
        if x3 == 0:
            error = abs(x3 - aproximacion_anterior)
        else:
            error = abs((x3 - aproximacion_anterior) / x3)

        # se para si la funcion ya vale casi cero o si el cambio entre iteraciones es chico
        if abs(fx3) < tolerancia or error < tolerancia:
            return {"raiz": x3, "iteracion": i + 1, "error": error}

        # aca se queda con la mitad donde sigue habiendo cambio de signo
        if fx1 * fx3 < 0:
            x2 = x3
            fx2 = fx3
        else:
            x1 = x3
            fx1 = fx3

    # si no converge dentro del maximo permitido, devuelve la ultima aproximacion calculada
    return {"raiz": x3, "iteracion": iteraciones, "error": error}
