from sympy import sympify, sin
import sys

# Parametros ingresados

expr_str = '3*x - 4'
iteraciones = 100
toleracia = 0.001
x1 = 100
x2 = 100
metodo = 'regla_falsa'

# Variables internas

funcion = sympify(expr_str)
x3_anterior = 0

x1_evaluada = 0
x2_evaluada = 0
x3_evaluada = 0

error = 0

# Funciones
def evaluar_funcion_en_x(x):
    print(f'evaluamos en {x}, da {funcion.subs("x", x).evalf()}')
    return(funcion.subs('x', x).evalf())

def calcular_x3_biseccion(x1, x2):
    global x3
    x3 = (x1 + x2)/2

def calcular_x3_regla_falsa(x1, x2):
    global x3
    x3 = (evaluar_funcion_en_x(x2) * x1 - evaluar_funcion_en_x(x1) * x2) / (evaluar_funcion_en_x(x2) - evaluar_funcion_en_x(x1))


x1_evaluada, x2_evaluada = evaluar_funcion_en_x(x1), evaluar_funcion_en_x(x2)
print('Fin evaluacion principal')
if(x1_evaluada*x2_evaluada > 0):
    print('la raiz no esta en el rango chau')
    sys.exit()
elif(x1_evaluada*x2_evaluada == 0):
    if(x1_evaluada):
        print(f'la raiz es {x1}')
    else:
        print(f'la raiz es {x2}')
    sys.exit()
else:
    for x in range(iteraciones):
        print('\n')
        print(f'iteracion {x}')
        if(metodo == 'biseccion'):
            print(f'calculamos x3 con biseccion')
            calcular_x3_biseccion(x1, x2)
        else:
            calcular_x3_regla_falsa(x1, x2)

        print(f'x3 = {x3}')
        x3_evaluada = evaluar_funcion_en_x(x3)
        error = abs((x3 - x3_anterior)/ x3)
        print(f'error = {error}')

        if( abs(x3_evaluada) < toleracia or error < toleracia):
            print(f'{x3} es raiz')
            sys.exit()
        else:
            print(f'no es raiz, actualizamos valores')
            if(x1_evaluada*x3_evaluada < 0):
                x2 = x3
            else:
                x1 = x3
        x3_anterior = x3
        print(f'valores actualizados {x1}, {x2}, {x3}')
    print(f'{x3} es la raiz, me quede sin iteraciones')