"""
valores de ingreso:
A: matriz de coeficientes
b: vector de términos independientes
tol: tolerancia para la convergencia
max_iter: número máximo de iteraciones permitidas
"""
def resolver_gauss_seidel(A, b, tol=1e-4, max_iteraciones=100):
    n = len(b)
    x = [0.0] * n  # vector inicial en 0

    for iteraciones in range(max_iteraciones):
        x_old = x.copy() # el copy es porque despues si modificamos x, x_old no se modifica, si hariamos x_old = x, entonces x_old y x apuntarian a la misma lista, y al modificar x, x_old tambien se modificaria
        for i in range(n):
            suma = 0.0
            for j in range(n):
                if i != j:
                    suma += A[i][j] * x[j]

            x[i] = (b[i] - suma) / A[i][i]

        # cálculo del error (norma infinito, pero casera)
        error = 0.0
        for i in range(n):
            diff = abs(x[i] - x_old[i])
            if diff > error:
                error = diff

        if error < tol:
            print(f"Convergió en {iteraciones+1} iteraciones")
            return x

    print("No convergió en el máximo de iteraciones")


# Para probar
# A = [[4, -1, 0, 0],
#      [-1, 4, -1, 0],
#      [0, -1, 4, -1],
#      [0, 0, -1, 3]]
# b = [15, 10, 10, 10]
# resultado = gauss_seidel(A, b)
# print("La solución es:", resultado)