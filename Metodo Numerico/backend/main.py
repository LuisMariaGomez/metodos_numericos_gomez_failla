
import traceback
import importlib.util
from pathlib import Path

from fastapi import Body, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from unidad1.metodos_abiertos import resolver_abiertos
from unidad1.metodos_cerrados import resolver_cerrados
from unidad2.gauss_jordan import resolver_gauss_jordan
from unidad2.gauss_seidel import resolver_gauss_seidel
from unidad3.regresion_lineal import regresion_lineal
from unidad3.regresion_polinomial import regresion_polinomial

BASE_DIR = Path(__file__).resolve().parent
INTEGRACION_PATH = BASE_DIR / "unidad 4" / "integracion_numerica.py"
spec_integracion = importlib.util.spec_from_file_location("integracion_numerica_mod", INTEGRACION_PATH)
integracion_numerica_mod = importlib.util.module_from_spec(spec_integracion)
spec_integracion.loader.exec_module(integracion_numerica_mod)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class datos(BaseModel):
    expr: str
    x1: float
    x2: Optional[float] = None
    iteraciones: int
    tolerancia: float
    metodo: str

class DatosRegresion(BaseModel):
    puntos: list[list[float]]
    tolerancia: float = 0.8
    grado: Optional[int] = None

class DatosIntegracion(BaseModel):
    funcion: str
    xi: float
    xd: float
    metodo: str
    n: Optional[int] = None


@app.exception_handler(Exception)
async def manejar_error_interno(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) or "Internal Server Error"}
    )

@app.get("/")
def index():
    return {"message": "API activa"}

@app.post("/resolver_gauss_jordan")
def resolver_gauss_jordan_api(
    matriz: list[list[float]] = Body(...),
    valores_independientes: list[float] = Body(...)
):
    resultado = resolver_gauss_jordan(matriz, valores_independientes)
    return resultado

@app.post("/resolver_gauss_seidel")
def resolver_gauss_seidel_api(
    matriz: list[list[float]] = Body(...),
    valores_independientes: list[float] = Body(...),
    tolerancia: float = Body(1e-4),
    iteraciones: int = Body(100)
):
    resultado = resolver_gauss_seidel(matriz,valores_independientes, tolerancia,iteraciones)
    return resultado

@app.post("/resolver_regresion_lineal")
def resolver_regresion_lineal_api(datos: DatosRegresion):
    if len(datos.puntos) < 2:
        raise HTTPException(status_code=400, detail="Carga al menos 2 puntos")

    resultado = regresion_lineal(datos.puntos, datos.tolerancia)
    return resultado

@app.post("/resolver_regresion_polinomial")
def resolver_regresion_polinomial_api(datos: DatosRegresion):
    if len(datos.puntos) < 2:
        raise HTTPException(status_code=400, detail="Carga al menos 2 puntos")

    if datos.grado is None:
        raise HTTPException(
            status_code=400,
            detail="El grado es obligatorio para la regresion polinomial"
        )

    if datos.grado < 1:
        raise HTTPException(status_code=400, detail="El grado debe ser mayor o igual a 1")

    if datos.grado >= len(datos.puntos):
        raise HTTPException(
            status_code=400,
            detail="El grado debe ser menor que la cantidad de puntos"
        )

    resultado = regresion_polinomial(datos.puntos, datos.grado, datos.tolerancia)
    return resultado

@app.post("/resolver_integracion")
def resolver_integracion_api(datos: DatosIntegracion):
    metodos = {
        "trapecios_simple": integracion_numerica_mod.calcular_integral_trapecios_simple,
        "trapecios_multiple": integracion_numerica_mod.calcular_integral_trapecios_multiple,
        "simpson_1_3_simple": integracion_numerica_mod.calcular_integral_simpson_1_3_simple,
        "simpson_1_3_multiple": integracion_numerica_mod.calcular_integral_simpson_1_3_multiple,
        "simpson_3_8": integracion_numerica_mod.calcular_integral_simpson_3_8,
        "simpson_combinado": integracion_numerica_mod.calcular_integral_simpson_combinado,
    }

    if datos.metodo not in metodos:
        raise HTTPException(status_code=400, detail="Metodo de integracion invalido")

    metodos_con_n = {"trapecios_multiple", "simpson_1_3_multiple", "simpson_combinado"}

    if datos.metodo in metodos_con_n:
        if datos.n is None or datos.n <= 0:
            raise HTTPException(status_code=400, detail="La cantidad de subintervalos debe ser mayor a 0")

        if datos.metodo == "simpson_1_3_multiple" and datos.n % 2 != 0:
            raise HTTPException(status_code=400, detail="Simpson 1/3 multiple requiere n par")

        if datos.metodo == "simpson_combinado" and datos.n < 2:
            raise HTTPException(status_code=400, detail="Simpson combinado requiere al menos 2 subintervalos")

        resultado = metodos[datos.metodo](datos.funcion, datos.xi, datos.xd, datos.n)
    else:
        resultado = metodos[datos.metodo](datos.funcion, datos.xi, datos.xd)

    if isinstance(resultado, str):
        raise HTTPException(status_code=400, detail=resultado)

    return {"area": resultado}

@app.get("/resolver_abiertos")
def resolver_abiertos_api(
    expr: str,
    x1: float,
    x2: Optional[float] = None,
    *,
    iteraciones: int,
    tolerancia: float,
    metodo: str,   # "secante" o "tangente"
):
    resultado = resolver_abiertos(expr, x1, x2, iteraciones, tolerancia, metodo)
    return resultado

@app.get("/resolver_cerrados")
def resolver_cerrados_api(
    expr: str,
    x1: float,
    x2: float, 
    iteraciones: int,
    tolerancia: float,
    metodo: str   # "biseccion" o "regla_falsa"
):
    resultado = resolver_cerrados(expr, x1, x2, iteraciones, tolerancia, metodo)
    return resultado
