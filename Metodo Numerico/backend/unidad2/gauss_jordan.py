"""
valores de ingreso:
matriz: matriz de coeficientes
valores_independientes: vector de terminos independientes
"""
def resolver_gauss_jordan(matriz, valores_independientes):
    n = len(matriz)
    # para recorrer las filas
    for i in range(n):
        #Caso de qe sea 0 el pivote y haya que hacer un intercambio de filas
        if matriz[i][i] == 0:
            for fila in range(i + 1, n):
                if matriz[fila][i] != 0:
                    matriz[i], matriz[fila] = matriz[fila], matriz[i]
                    valores_independientes[i], valores_independientes[fila] = (
                        valores_independientes[fila],
                        valores_independientes[i],
                    )
                    break
                else:
                    raise ValueError("No se puede continuar: pivote nulo.")

        valor_pivote = matriz[i][i]
        
        # para recorrer las columnas
        for k in range(n):
            matriz[i][k] = matriz[i][k] / valor_pivote

        valores_independientes[i] = valores_independientes[i] / valor_pivote

        # para recorrer las filas sin tocar los indices que usamos antes
        for l in range(n):
            # si es la fila del pivote no se hace nada
            if l == i:
                continue

            valor_a_0 = matriz[l][i]

            # para recorrer las columnas y hacer 0 el valor debajo del pivote y reducir el resto de la fila
            for m in range(n):
                matriz[l][m] = matriz[l][m] - valor_a_0 * matriz[i][m]

            valores_independientes[l] = (
                valores_independientes[l] - valor_a_0 * valores_independientes[i]
            )

    return valores_independientes
