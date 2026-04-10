
#http://127.0.0.1:8000
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from metodos_abiertos import resolver_abiertos
from metodos_cerrados import resolver_cerrados

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
    x2: float
    iteraciones: int
    tolerancia: float
    metodo: str

@app.get("/")
def index():
    return {"message": "API activa"}

@app.get("/resolver_abiertos")
def resolver_abiertos_api(
    expr: str,
    x1: float,
    x2: float,
    iteraciones: int,
    tolerancia: float,
    metodo: str   # "secante" o "tangente"
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