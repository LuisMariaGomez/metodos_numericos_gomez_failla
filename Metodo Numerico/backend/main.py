
#http://127.0.0.1:8001
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi import Body
from typing import Optional
from unidad1.metodos_abiertos import resolver_abiertos
from unidad1.metodos_cerrados import resolver_cerrados
from unidad2.gauss_jordan import resolver_gauss_jordan
from unidad2.gauss_seidel import resolver_gauss_seidel

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

from fastapi import Body

@app.post("/resolver_gauss_seidel")
def resolver_gauss_seidel_api(
    matriz: list[list[float]] = Body(...),
    valores_independientes: list[float] = Body(...),
    tolerancia: float = Body(1e-4),
    iteraciones: int = Body(100)
):
    resultado = resolver_gauss_seidel(matriz,valores_independientes, tolerancia,iteraciones)
    return resultado

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
