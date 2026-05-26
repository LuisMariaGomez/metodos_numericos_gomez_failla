from sympy import diff, symbols
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application
)
from .expresiones import contexto_sympy, normalizar_expresion

def resolver_abiertos(expr_str, x1, x2, iteraciones, tolerancia, metodo):
    try:
        # prepara la expresion para SymPy: (todo esta en el otro archivo de expresiones porque aca hace ruido)
        # convierte ^ en ** y reemplaza |...| por Abs(...)
        transformations = standard_transformations + (implicit_multiplication_application,)
        expr_str = normalizar_expresion(expr_str)

        # crea la variable x y arma la funcion con lo que se manda por el front
        x = symbols('x')
        funcion = parse_expr(expr_str, transformations=transformations, local_dict=contexto_sympy(x))

        # deriva la expresion pasada (solo se usa en el metodo de tangente / Newton)
        derivada = diff(funcion, x)

        def evaluar_expresion(expresion, valor, nombre):
            resultado = expresion.subs(x, valor).evalf()

            if resultado.is_real is False or resultado.is_finite is False:
                raise ValueError(f"La {nombre} no está definida en x = {valor}")

            try:
                return float(resultado)
            except (TypeError, ValueError):
                raise ValueError(f"La {nombre} no está definida en x = {valor}")

        def f(valor):
            return evaluar_expresion(funcion, valor, "función")

        def derivadaf(valor):
            return evaluar_expresion(derivada, valor, "derivada")

        x3 = x1
        error = 0

        # evalua la funcion en los valores iniciales
        fx1 = f(x1)
        if metodo == "secante":
            fx2 = f(x2)
        else:
            fx2 = None  # no se usa en tangente

        # si alguno de los puntos iniciales ya es raiz, no hace falta iterar, ya le mandamos que es raiz
        if abs(fx1) < tolerancia:
            return {"raiz": x1, "iteracion": 0, "error": 0}

        if metodo == "secante" and fx2 is not None and abs(fx2) < tolerancia:
            return {"raiz": x2, "iteracion": 0, "error": 0}

        for i in range(iteraciones):
            # guarda la aproximacion previa para calcular el error relativo
            aproximacion_anterior = x2 if metodo == "secante" else x1

            if metodo == "secante":
                # formula de la secante, usa dos aproximaciones anteriores
                if fx2 - fx1 == 0:
                    return {"raiz": None, "iteracion": None, "error": "División por cero"}

                x3 = (fx2 * x1 - fx1 * x2) / (fx2 - fx1)

            elif metodo == "tangente":
                # formula de Newton-Raphson x_(n+1) = x_n - f(x_n) / f'(x_n)
                d = derivadaf(x1)
                if abs(d) < tolerancia:
                    return {"raiz": None, "iteracion": None, "error": "Derivada casi cero"}

                x3 = x1 - fx1 / d

            else:
                return {"raiz": None, "iteracion": None, "error": "Método inválido"}

            # error relativo aproximado entre la iteracion actual y la anterior
            if x3 == 0:
                error = abs(x3 - aproximacion_anterior)
            else:
                error = abs((x3 - aproximacion_anterior) / x3)

            fx3 = f(x3)

            # se para si la funcion ya vale casi cero o si el cambio entre iteraciones es chico
            if abs(fx3) < tolerancia or error < tolerancia:
                return {"raiz": x3, "iteracion": i + 1, "error": error}

            if metodo == "secante":
                # en secante avanza desplazando el par de puntos: (x1, x2) <- (x2, x3)
                x1, x2 = x2, x3
                fx1, fx2 = fx2, fx3
            else:
                # en Newton usa la nueva aproximacion como punto de partida de la siguiente vuelta
                x1 = x3
                fx1 = fx3

        # si no converge dentro del maximo permitido, devuelve la ultima aproximacion calculada
        return {"raiz": x3, "iteracion": iteraciones, "error": error}
    except Exception as error:
        return {"raiz": None, "iteracion": None, "error": str(error)}
