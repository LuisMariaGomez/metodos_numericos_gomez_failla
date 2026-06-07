import math

# gauss jordan
def gauss_jordan(matriz):
    filas = len(matriz)
    cols = len(matriz[0])
    
    for i in range(filas):
        # pivoteo
        max_fila = i
        for k in range(i + 1, filas):
            if abs(matriz[k][i]) > abs(matriz[max_fila][i]):
                max_fila = k
        matriz[i], matriz[max_fila] = matriz[max_fila], matriz[i]
        
        pivote = matriz[i][i]
        if pivote == 0:
            return [0] * filas # retorno de seguridad si la matriz no tiene solución
            
        # hacer que el pivote sea 1
        for j in range(cols):
            matriz[i][j] /= pivote
            
        # hacer 0 el resto de la columna
        for k in range(filas):
            if k != i:
                factor = matriz[k][i]
                for j in range(cols):
                    matriz[k][j] -= factor * matriz[i][j]
                    
    # devolver la última columna, que contiene las incógnitas (a0, a1, a2, etc.)
    return [matriz[i][cols - 1] for i in range(filas)]


# generar matriz polinomial
def generar_matriz_polinomial(grado, puntos):
    """arma la matriz sumando las multiplicaciones de x e y"""
    dimension = grado + 1
    
    # armar una matriz llena de ceros de (dimension) x (dimension + 1)
    matriz = [[0.0 for _ in range(dimension + 1)] for _ in range(dimension)]
    
    # para cada punto en el puntosCargados 
    for punto in puntos:
        x = punto[0]
        y = punto[1]
        
        for fila in range(dimension):
            for col in range(dimension):
                # vemos los coeficientes de las incógnitas 
                matriz[fila][col] += math.pow(x, fila + col) 
            
            # sacar los términos independientes
            matriz[fila][dimension] += y * math.pow(x, fila)
            
    return matriz


# ahora si la regresion polinomial
def regresion_polinomial(puntos_cargados, grado, tolerancia=0.8):
    n = len(puntos_cargados)
    if n == 0:
        return "Error: No hay puntos."

    # armar la matriz
    matriz = generar_matriz_polinomial(grado, puntos_cargados)
    
    # obtener el valor de cada incógnita usando Gauss-Jordan 
    vector_resultado = gauss_jordan(matriz)
    
    # armar la función y calcular el coeficiente (r)
    
    # ojoooo aca, armado de la función (string builder simplificado)
    terminos = []
    # recorremos de mayor a menor para que el string quede ej: "3x^2 + 2x + 1"
    for i in range(len(vector_resultado) - 1, -1, -1): # acordate que el -1 al final es apra recorrer en reversa
        ai = vector_resultado[i]
        
        if i == 0:
            terminos.append(f"{ai:.4f}")
        elif i == 1:
            terminos.append(f"{ai:.4f}x")
        else:
            terminos.append(f"{ai:.4f}x^{i}")
            
    # unimos todo con " + " y los casos de "+ -" que queden "- "
    funcion_str = " + ".join(terminos).replace("+ -", "- ")
    funcion = f"y = {funcion_str}"
    
    # calcular el coeficiente de correlación (r)
    sum_y = sum(punto[1] for punto in puntos_cargados)
    promedio_y = sum_y / n
    
    sr = 0.0
    st = 0.0
    
    # para c/punto en puntosCargados
    for punto in puntos_cargados:
        x = punto[0]
        y = punto[1] 
        
        # calcular el "y" de nuestra función polinomial reemplazando la "x"
        suma_y_calculado = 0.0 
        for i in range(len(vector_resultado)):
            suma_y_calculado += vector_resultado[i] * math.pow(x, i)
            
        sr += math.pow(suma_y_calculado - y, 2) # 
        st += math.pow(promedio_y - y, 2)
        
    # r final
    if st == 0:
        r = 100.0 if sr == 0 else 0.0
    else:
        r = math.sqrt((st - sr) / st) * 100
        
    # Validar ajuste
    ajuste = "Aceptable" if (r / 100) >= tolerancia else "No aceptable"
    
    return {
        "Función": funcion,
        "Coeficiente de correlación (r)": f"{r:.4f}%",
        "Efectividad de ajuste": f"El ajuste es {ajuste.lower()}." # esto es para que quede "El ajuste es aceptable." o "El ajuste es no aceptable."
    }



# Lo mismo, crtl + k + u para probar 

# Prueba grado 2
# puntos_prueba_1 = [
#     [-1, 6],
#     [0, 4],
#     [2, 1],
#     [3, 1],
#     [5, 2],
#     [6, 5]
# ]

# print("--- Prueba Grado 2 ---")
# resultado_1 = regresion_polinomial(puntos_prueba_1, grado=2)
# for clave, valor in resultado_1.items():
#     print(f"{clave}: {valor}")


# print("\n")


# # Prueba grado 4 
# puntos_prueba_2 = [
#     [-3.2, 4.8],
#     [-2.75, -4.05],
#     [-1, 0],
#     [0, 3],
#     [0.5, 2],
#     [1.5, -1.4],
#     [2, 0],
#     [2.33, 4]
# ]

# print("--- Prueba Grado 4 ---")
# resultado_2 = regresion_polinomial(puntos_prueba_2, grado=4)
# for clave, valor in resultado_2.items():
#     print(f"{clave}: {valor}")