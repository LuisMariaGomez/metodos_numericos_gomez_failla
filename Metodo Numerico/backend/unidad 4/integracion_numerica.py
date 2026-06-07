import math

def evaluar_funcion(funcion_str, valor_x):
    funcion_str = funcion_str.replace('^', '**')

    entorno = {"x": valor_x}
    entorno.update(math.__dict__)
    
    try:
        return eval(funcion_str, entorno)
    except Exception:
        return "Error: Función mal ingresada"

# trapecios simple y múltiple

def calcular_integral_trapecios_simple(funcion, xi, xd):
    """
    formula: ((f(a) + f(b)) * (b - a)) / 2
    """

    # obtenemos f(xi) y f(xd)
    f_xi = evaluar_funcion(funcion, xi)
    f_xd = evaluar_funcion(funcion, xd)
    
    if type(f_xi) == str or type(f_xd) == str:
        return "Funcion mal ingresada" 
        
    return ((f_xi + f_xd) * (xd - xi)) / 2

def calcular_integral_trapecios_multiple(funcion, xi, xd, n):
    """
    Fórmula: (h/2) * (f(a) + 2*Sumatoria + f(b))
    """
    h = (xd - xi) / n
    suma = 0.0
    
    for i in range(1, n):
        # es como EvaluaFx(xi + h*i)
        suma += evaluar_funcion(funcion, xi + h * i)
        
    f_xi = evaluar_funcion(funcion, xi)
    f_xd = evaluar_funcion(funcion, xd)
    
    return (h / 2) * (f_xi + 2 * suma + f_xd)

# simpson 1/3 simple y múltiple

def calcular_integral_simpson_1_3_simple(funcion, xi, xd):
    """
    Fórmula: (h/3) * (f(a) + 4*f(a+h) + f(b))
    """
    
    h = (xd - xi) / 2

    f_xi = evaluar_funcion(funcion, xi)
    f_xih = evaluar_funcion(funcion, xi + h)
    f_xd = evaluar_funcion(funcion, xd)
    
    return (h / 3) * (f_xi + 4 * f_xih + f_xd)

def calcular_integral_simpson_1_3_multiple(funcion, xi, xd, n):
    """
    Separa sumatorias en índices pares e impares
    """

    h = (xd - xi) / n
    sum_pares = 0.0
    sum_impares = 0.0

    for i in range(1, n):
        valor_evaluado = evaluar_funcion(funcion, xi + h * i)
        if i % 2 == 0:
            sum_pares += valor_evaluado
        else:
            sum_impares += valor_evaluado
            
    f_xi = evaluar_funcion(funcion, xi)
    f_xd = evaluar_funcion(funcion, xd)
    
    return (h / 3) * (f_xi + 4 * sum_impares + 2 * sum_pares + f_xd)

# simpson 3/8 simple

def calcular_integral_simpson_3_8(funcion, xi, xd):
    """
    Fórmula: (3*h/8) * (f(a) + 3*f(a+h) + 3*f(a+2h) + f(b))
    """

    h = (xd - xi) / 3
    
    f_xi = evaluar_funcion(funcion, xi)
    f_xih1 = evaluar_funcion(funcion, xi + h)
    f_xih2 = evaluar_funcion(funcion, xi + 2 * h)
    f_xd = evaluar_funcion(funcion, xd)
    
    return (3 * h / 8) * (f_xi + 3 * f_xih1 + 3 * f_xih2 + f_xd)

# simpson combinado (1/3 multiple + 3/8)

def calcular_integral_simpson_combinado(funcion, xi, xd, n):
    """
    Si la cantidad de intervalos es impar, calcula los últimos 3 con Simpson 3/8,
    y el resto con Simpson 1/3 Múltiple.
    """
    # si la función está mal escrita, cortamos rápido
    if type(evaluar_funcion(funcion, xi)) == str:
        return "Funcion mal ingresada"

    h = (xd - xi) / n
    resultado = 0.0
    
    # vemos si la cantidad de intervalos es impar
    if n % 2 != 0:
        # el intervalo nuevo serán los últimos 3 subintervalos
        nuevo_xi = xi + h * (n - 3)
        
        # calculamos la última parte con Simpson 3/8
        resultado += calcular_integral_simpson_3_8(funcion, nuevo_xi, xd)
        
        # se ajusta el 'n' y 'xd' para el remanente
        n = n - 3
        xd = nuevo_xi
        
    # si sobraron intervalos pares, calculamos el resto con Simpson 1/3 Múltiple
    if n > 0:
        resultado += calcular_integral_simpson_1_3_multiple(funcion, xi, xd, n)
        
    return resultado

# pruebas

# funcion_texto = "x**2"
# xi = 0.0
# xd = 2.0
# intervalos_n = 5  # impar para probar el método combinado

# print(f"--- Evaluando función: F(x) = {funcion_texto} de Xi={xi} a Xd={xd} ---")

# res_trap_simp = calcular_integral_trapecios_simple(funcion_texto, xi, xd)
# print(f"Trapecios Simple: {res_trap_simp}")

# res_trap_mult = calcular_integral_trapecios_multiple(funcion_texto, xi, xd, intervalos_n)
# print(f"Trapecios Múltiple (n={intervalos_n}): {res_trap_mult}")

# res_simp_13_simp = calcular_integral_simpson_1_3_simple(funcion_texto, xi, xd)
# print(f"Simpson 1/3 Simple: {res_simp_13_simp}")

# res_simp_38 = calcular_integral_simpson_3_8(funcion_texto, xi, xd)
# print(f"Simpson 3/8: {res_simp_38}")

# res_combinado = calcular_integral_simpson_combinado(funcion_texto, xi, xd, intervalos_n)
# print(f"Simpson Combinado (n={intervalos_n}): {res_combinado}")