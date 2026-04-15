import re

from sympy import Abs


def normalizar_expresion(expr_str):
    expr_str = expr_str.replace("^", "**")
    expr_str = _reemplazar_valor_absoluto(expr_str)
    return expr_str


def contexto_sympy(x):
    return {"x": x, "Abs": Abs}


def _reemplazar_valor_absoluto(expr_str):
    patron = re.compile(r"\|([^|]+)\|")
    expresion = expr_str

    while True:
        expresion_actualizada, reemplazos = patron.subn(r"Abs(\1)", expresion)
        if reemplazos == 0:
            break
        expresion = expresion_actualizada

    if "|" in expresion:
        raise ValueError("Expresión inválida: barras de valor absoluto desbalanceadas")

    return expresion
