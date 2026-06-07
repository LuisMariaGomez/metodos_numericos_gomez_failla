import math

def regresion_lineal(puntos_cargados, tolerancia=0.8):
    # agarramos la cantidad de puntos de entrada (n)
    n = len(puntos_cargados)
    
    # Validación simple por si la lista está vacía
    if n == 0:
        return "Error: No hay puntos."

    # arrancamos las sumatorias en cero
    sum_x = 0.0
    sum_y = 0.0
    sum_xy = 0.0
    sum_x2 = 0.0

    # recorremos los puntos y calcular todas las sumatorias juntas
    for punto in puntos_cargados:
        x = punto[0] # posicion cero del array
        y = punto[1] # posicion uno del array
        
        sum_x += x              # paso 2: Sumatoria de X
        sum_y += y              # paso 3: Sumatoria de Y
        sum_xy += x * y         # paso 4: Sumatoria de X * Y
        sum_x2 += x * x         # paso 5: Sumatoria de X al cuadrado

    # calcular a1 (pendiente de la recta)
    # puse a parte el denominador para evitar errores
    denominador = (n * sum_x2) - (sum_x ** 2)
    
    if denominador == 0:
        return "Error: División por cero. No se puede calcular la regresión."
        
    a1 = (n * sum_xy - sum_x * sum_y) / denominador

    # calcular a0 (la ordenada al origen)
    promedio_x = sum_x / n
    promedio_y = sum_y / n
    a0 = promedio_y - a1 * promedio_x

    # sacar St y Sr
    st = 0.0
    sr = 0.0
    
    for punto in puntos_cargados:
        x = punto[0]
        y = punto[1]
        
        # 8a. St += (PromedioY - y)^2
        st += (promedio_y - y) ** 2
        
        # 8b. Sr += (a1 * x + a0 - y)^2
        sr += (a1 * x + a0 - y) ** 2

    # el coeficiente de correlación r
    # validar si St da 0
    if st == 0:
        r = 100.0 if sr == 0 else 0.0
    else:
        # Math.Sqrt es math.sqrt en Python
        r = math.sqrt((st - sr) / st) * 100

    # devolver los resultados
    # darle algo de formato la función a texto (string) limitando los decimales a 4
    funcion = f"y = {a1:.4f}x + {a0:.4f}"
    
    # evaluar la efectividad del ajuste
    # el "r" calculado está en porcentaje (ej: 85.5), la tolerancia es 0.8 (decimal).
    # convertimos r a decimal para comparar, o convertimos la tolerancia a porcentaje.
    if (r / 100) >= tolerancia: 
        ajuste = "Aceptable"
    else:
        ajuste = "No aceptable"

    # devolver los datos
    return {
        "Función": funcion,
        "Porcentaje de efectividad": f"{r:.2f}%",
        "Efectividad de ajuste": ajuste
    }


# para probar/ selecciona todo y dale al crtl + k + u para quitar los comentarios y probar la función 

# puntos_completos = [
#     [-3, -7.5],
#     [0.5, -2.25],
#     [1, -1.5],
#     [1.5, 1],
#     [2, 0],
#     [3, 0],
#     [5, 4.5]
# ]

# print("--- PRUEBA 1: Todos los puntos ---")
# resultado_1 = regresion_lineal(puntos_completos)
# for clave, valor in resultado_1.items():
#     print(f"{clave}: {valor}")

# puntos_reducidos = [
#     [-3, -7.5],
#     [0.5, -2.25],
#     [1, -1.5],
#     [2, 0],
#     [5, 4.5]
# ]

# print("\n--- PRUEBA 2: Quitando los puntos (1.5, 1) y (3, 0) ---")
# resultado_2 = regresion_lineal(puntos_reducidos)
# for clave, valor in resultado_2.items():
#     print(f"{clave}: {valor}")