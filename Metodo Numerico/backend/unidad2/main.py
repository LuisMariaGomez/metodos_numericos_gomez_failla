matriz = [[5, 1, 4.01015],[-1.301525, 0.25, 1.10075],[3.751125, 0.801216, 3.002028]]
valores_independientes = [1, 0.225, 0.75]

n = len(matriz)
for i in range(n):
    for j in range(n):
        if (i==j):
            valor_pivote =  matriz[i][j]
            for k in range(1,n):
                matriz[i][k] = matriz[i][k] / valor_pivote
            matriz[i][j]=1

print(matriz)