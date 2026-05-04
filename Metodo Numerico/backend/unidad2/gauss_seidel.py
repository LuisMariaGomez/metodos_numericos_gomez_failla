def resolver_gauss_seidel(matriz, valores_independientes, tol=1e-4, max_iteraciones=100):
    n = len(valores_independientes)
    x = [0.0] * n

    for iteraciones in range(max_iteraciones):
        x_old = x.copy()

        for i in range(n):
            suma = 0.0
            for j in range(n):
                if i != j:
                    suma += matriz[i][j] * x[j]

            x[i] = (valores_independientes[i] - suma) / matriz[i][i]

        error = max(abs(x[i] - x_old[i]) for i in range(n))

        if error < tol:
            return {
                "convergio": True,
                "iteraciones": iteraciones + 1,
                "solucion": x,
                "error": error
            }

    return {
        "convergio": False,
        "iteraciones": max_iteraciones,
        "solucion": x,
        "error": error,
        "mensaje": "No convergió en el máximo de iteraciones"
    }