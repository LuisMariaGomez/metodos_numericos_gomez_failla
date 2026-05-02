n = int(input("Ingrese la cantidad de filas de la matriz: "))

matriz = []
valores_independientes = []

for i in range(n):
    fila = []
    print(f"\nIngrese los valores de la fila {i + 1}:")

    for j in range(n):
        valor = float(input(f"Ingrese el valor de A[{i + 1}][{j + 1}]: "))
        fila.append(valor)

    valor_independiente = float(
        input(f"Ingrese el termino independiente de la fila {i + 1}: ")
    )

    matriz.append(fila)
    valores_independientes.append(valor_independiente)

print()
# para recorresr las filas
for i in range(n):
    #Caso de qe sea 0 el pivote
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

    print("\n Hacer 1 al pivote y dividir el resto de la fila")
    valor_pivote = matriz[i][i]
    print(valor_pivote)
    
    # para recorrer las columnas
    for k in range(n):
        print(f"se hace {matriz[i][k]} / {valor_pivote}")
        matriz[i][k] = matriz[i][k] / valor_pivote
        print(f"dando {matriz[i][k]}")

    print(
        f"se hace valor independiente: {valores_independientes[i]} / {valor_pivote}"
    )
    valores_independientes[i] = valores_independientes[i] / valor_pivote
    print(f"dando: {valores_independientes[i]}")
    print(f"la fila queda {matriz[i]} | {valores_independientes[i]} \n")

    print("Reducir el resto de filas")
    # para recorrer las filas sin tocar los indices que usamos antes
    for l in range(n):
        # si es la fila del pivote no se hace nada
        if l == i:
            continue

        valor_a_0 = matriz[l][i]
        print(f"\n valor a hacer 0: {valor_a_0}\n")

        # para recorrer las columnas y hacer 0 el valor debajo del pivote y reducir el resto de la fila
        for m in range(n):
            print(f"se hace {matriz[l][m]} - {valor_a_0} * {matriz[i][m]}, dando {matriz[l][m] - valor_a_0 * matriz[i][m]}")
            matriz[l][m] = matriz[l][m] - valor_a_0 * matriz[i][m]

        valores_independientes[l] = (
            valores_independientes[l] - valor_a_0 * valores_independientes[i]
        )


print("Validaciones")
for i in range(n):
    print(f"{matriz[i]} | {valores_independientes[i]}")
