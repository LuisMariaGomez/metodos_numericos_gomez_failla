from sympy import sympify, sin, diff, symbols
import sys
import math

# Parametros ingresados

expr_str = '3*x - 4'
iteraciones = 100
toleracia = 0.001
x1 = 100
x2 = 0
metodo = 'secante'

# Variables internas

funcion = sympify(expr_str)
x = symbols('x')
derivada = diff(funcion, x)

x3_anterior = 0
x1_evaluada = 0
x2_evaluada = 0
x3_evaluada = 0
error = 0

print("Función:", expr_str)
print("Derivada:", derivada)

# Funciones
def evaluar_funcion_en_x(x):
    print(f'evaluamos en {x}, da {funcion.subs("x", x).evalf()}')
    return(funcion.subs('x', x).evalf())

def evaluar_derivada_funcion_en_x(x):
    print(f'evaluamos en {x}, da {derivada.subs("x", x).evalf()}')
    return(derivada.subs("x", x).evalf())

def calcular_x3_tangente(x):
    global x3
    valor_derivada = evaluar_derivada_funcion_en_x(x)
    if(valor_derivada < toleracia or valor_derivada == 0):
        print('El metodo diverge, no se encuentra raiz')
    else:
        x3 = x1 - (x1_evaluada / valor_derivada)

def calcular_x3_secante(x1, x2):
    global x3
    x3 = (evaluar_funcion_en_x(x2) * x1 - evaluar_funcion_en_x(x1) * x2) / (evaluar_funcion_en_x(x2) - evaluar_funcion_en_x(x1))

x1_evaluada, x2_evaluada = evaluar_funcion_en_x(x1), evaluar_funcion_en_x(x2)
if(abs(x1_evaluada)<toleracia):
    print(f'x1: {x1} es raiz')
elif(metodo=='secante' and abs(x2_evaluada)< toleracia):
    print(f'x2: {x2} es raiz')
else:
    for x in range(iteraciones):
        if(metodo=='secante'):
            calcular_x3_secante(x1, x2)
        else:
            calcular_x3_tangente(x1)
        
        if math.isnan(x3):
            print("xr es NaN")
            sys.exit()
        
        error = abs((x3 - x3_anterior)/x3)

        if (abs(evaluar_funcion_en_x(x3))<toleracia or error<toleracia):
            print(f'x3 {x3} es raiz')
            sys.exit()
        else:
            if(metodo=='tangente'):
                x1 = x3
            else:
                x1 = x2
                x2 = x3
            x3_anterior = x3
    print(f'x3 {x3} es raiz, me quede sin iteraciones')