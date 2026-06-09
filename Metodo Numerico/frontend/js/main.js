let metodoSeleccionado = '';
let applet;

function seleccionarMetodo(metodo, boton) {
    metodoSeleccionado = metodo;
    const botones = document.querySelectorAll('.metodo-btn');
    botones.forEach(b => b.classList.remove('selected'));
    if (boton) {
        boton.classList.add('selected');
    }
    actualizarVisibilidadEstadoSistema();
}

function seleccionarRegresion(metodo, boton) {
    seleccionarMetodo(metodo, boton);
    const gradoContainer = document.getElementById("grado-container");
    if (gradoContainer) {
        gradoContainer.classList.toggle("is-hidden", metodo !== "polinomial");
    }
}

function init() {
    if (typeof GGBApplet === "undefined") return; // 👈 clave
    const graficoId = ["grafico-integracion", "grafico-regresion", "grafico"]
        .find(id => document.getElementById(id));
    if (!graficoId) return;

    let params = {
        appName: "graphing",
        width: 1650,
        height: 900,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false
    };

    applet = new GGBApplet(params, true);
    window.applet = applet;
    applet.inject(graficoId);
}

/* METODOS ABIERTOS Y CERRADOS */
async function graficar_y_calcular() {

    // Tomar valores del form
    const expr = document.getElementById("expr_str").value.trim();
    const x1 = document.getElementById("x1").value.trim();
    const x2 = document.getElementById("x2").value.trim();
    const iteraciones = document.getElementById("iteraciones").value.trim();
    const tolerancia = document.getElementById("tolerancia").value.trim();

    if (!metodoSeleccionado) {
        alert("Selecciona un método primero");
        return;
    }

    if (!expr || !x1 || !iteraciones || !tolerancia) {
        alert("Completa función, x1, iteraciones y tolerancia");
        return;
    }

    if (metodoSeleccionado !== "tangente" && !x2) {
        alert("El método seleccionado requiere x2");
        return;
    }

    const endpoint = (metodoSeleccionado === "secante" || metodoSeleccionado === "tangente")
        ? "resolver_abiertos"
        : "resolver_cerrados";

    const params = new URLSearchParams({
        expr,
        x1,
        iteraciones,
        tolerancia,
        metodo: metodoSeleccionado
    });

    if (x2 && metodoSeleccionado !== "tangente") {
        params.append("x2", x2);
    }

    const url = `http://127.0.0.1:8001/${endpoint}?${params.toString()}`;

    try {
        // Llamada a FastAPI
        const response = await fetch(url);
        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await response.json()
            : null;

        if (!response.ok) {
            throw new Error(
                data?.detail || data?.error || `HTTP ${response.status}: ${response.statusText}`
            );
        }

        // Mostrar resultados en pantalla
        if (typeof data.error === "string") {
            // Error real del backend
            document.getElementById("result-iteraciones").textContent = "-";
            document.getElementById("result-raiz").textContent = data.error;
            document.getElementById("result-error").textContent = "-";
        } else {
            // Resultado correcto
            document.getElementById("result-iteraciones").textContent =
                data.iteracion ?? "N/A";

            document.getElementById("result-raiz").textContent =
                data.raiz !== null && data.raiz !== undefined
                    ? Number(data.raiz).toFixed(6)
                    : "N/A";

            document.getElementById("result-error").textContent =
                data.error !== null && data.error !== undefined
                    ? Number(data.error).toFixed(6)
                    : "N/A";
        }

    } catch (err) {
        const mensaje = err.message || "Error inesperado";
        const esErrorDeConexion = err instanceof TypeError;

        document.getElementById("result-iteraciones").textContent = "-";
        document.getElementById("result-raiz").textContent = esErrorDeConexion
            ? "No se pudo conectar con la API"
            : "Error al calcular";
        document.getElementById("result-error").textContent = esErrorDeConexion
            ? `${mensaje} (${url})`
            : mensaje;
    }

    // borrar gráfico anterior
    if (window.applet && window.applet.getAppletObject()) {
        window.applet.getAppletObject().reset();
        // graficar función
        window.applet.getAppletObject().evalCommand("f(x) = " + expr);
    }
}
window.onload = () => {
    if (
        document.getElementById("grafico") ||
        document.getElementById("grafico-regresion") ||
        document.getElementById("grafico-integracion")
    ) {
        init();
    }
};

document.getElementById("optimizar-btn")?.addEventListener("click", generarMatriz);
document.getElementById("generar-puntos-btn")?.addEventListener("click", generarPuntosRegresion);

function mostrarResultadoSistema(index, value) {
    const resultElement = document.getElementById(`result-${index}`);
    if (resultElement) {
        resultElement.textContent = value;
    }
}

function mostrarEstadoSistema(value, convergio = null) {
    const estadoElement = document.getElementById("result-estado");
    if (!estadoElement) return;

    estadoElement.textContent = value;
    estadoElement.classList.remove("status-ok", "status-error");

    if (convergio === true) {
        estadoElement.classList.add("status-ok");
    } else if (convergio === false) {
        estadoElement.classList.add("status-error");
    }
}

function limpiarEstadoSistema() {
    mostrarEstadoSistema("");
}

function actualizarVisibilidadEstadoSistema() {
    const estadoElement = document.getElementById("result-estado");
    const estadoRow = estadoElement?.closest(".result-row");
    if (!estadoRow) return;

    estadoRow.classList.toggle("is-hidden", metodoSeleccionado !== "gauss_seidel");
}

function generarMatriz() {
    const size = parseInt(document.getElementById("matrix-size").value);

    if (!size || size < 2 || size > 6) {
        alert("Ingresá un tamaño entre 2 y 6");
        return;
    }

    const matrixTable = document.querySelector(".matrix-table tbody");
    const tiTable = document.querySelector(".ti-table tbody");
    const resultContainer = document.getElementById("result-container");

    // 🔹 Limpiar tablas
    matrixTable.innerHTML = "";
    tiTable.innerHTML = "";

    // 🔹 Limpiar resultados
    resultContainer.innerHTML = "";

    // 🔹 Generar matriz NxN
for (let i = 0; i < size; i++) {
    const tr = document.createElement("tr");

    for (let j = 0; j < size; j++) {
        const td = document.createElement("td");
        const input = document.createElement("input");

        input.type = "number";
        input.placeholder = `a${i+1}${j+1}`;

        // 🔹 Agrandar inputs
        input.style.width = "120px";
        input.style.height = "45px";
        input.style.fontSize = "18px";
        input.style.textAlign = "center";

        td.appendChild(input);
        tr.appendChild(td);
    }
        matrixTable.appendChild(tr);

        // 🔹 Término independiente
        const trTI = document.createElement("tr");
        const tdTI = document.createElement("td");
        const inputTI = document.createElement("input");

        inputTI.type = "number";
        inputTI.placeholder = `b${i+1}`;

        tdTI.appendChild(inputTI);
        trTI.appendChild(tdTI);

        tiTable.appendChild(trTI);

        document.querySelector(".card").style.width = "100%";
        document.querySelector(".card").style.minWidth = `${size * 140}px`;
        const resultCard = document.getElementById("result-card");
        resultCard.style.position = "relative";
        resultCard.style.left = "150px";   //270 para 5x5, 150 para 4x4
    }

    // 🔹 Generar resultados dinámicos
    for (let i = 0; i < size; i++) {
        const row = document.createElement("div");
        row.classList.add("result-row");

        const label = document.createElement("label");
        label.textContent = `x${i+1}`;

        const span = document.createElement("span");
        span.classList.add("result-value-large");
        span.id = `result-${i}`;

        row.appendChild(label);
        row.appendChild(span);

        resultContainer.appendChild(row);
    }

    // 🔹 Volver a agregar botones
    const estadoRow = document.createElement("div");
    estadoRow.classList.add("result-row");

    const estadoLabel = document.createElement("label");
    estadoLabel.textContent = "Estado";

    const estadoSpan = document.createElement("span");
    estadoSpan.classList.add("result-value-large", "result-status");
    estadoSpan.id = "result-estado";

    estadoRow.appendChild(estadoLabel);
    estadoRow.appendChild(estadoSpan);
    resultContainer.appendChild(estadoRow);
    actualizarVisibilidadEstadoSistema();

    const botones = document.createElement("div");
    botones.classList.add("button-grid");

    botones.innerHTML = `
        <button class="metodo-btn" onclick="seleccionarMetodo('gauss_jordan', this)">Gauss-Jordan</button>
        <button class="metodo-btn" onclick="seleccionarMetodo('gauss_seidel', this)">Gauss-Seidel</button>
    `;

    resultContainer.appendChild(botones);
}
/* GAUSS SEIDEL Y JORDAN */
async function calcular_sistema() {

    const tolerancia = document.getElementById("tolerancia").value.trim();
    const iteraciones = document.getElementById("iteraciones").value.trim();
    const size = parseInt(document.getElementById("matrix-size")?.value);

    if (!size) return;
   if (!metodoSeleccionado) {
        alert("Selecciona un método primero");
        return;
    }

    // Obtener matriz
    const filas = document.querySelectorAll(".matrix-table tbody tr");
    let matriz = [];

    filas.forEach(fila => {
        const inputs = fila.querySelectorAll("input");
        let filaValores = [];

        inputs.forEach(input => {
            const valor = input.value.trim();
            if (valor === "" || isNaN(valor)) {
                filaValores.push(0);
            } else {
                filaValores.push(parseFloat(valor));
            }
        });

        matriz.push(filaValores);
    });

    // Obtener términos independientes
    const tiInputs = document.querySelectorAll(".ti-table input");
    let valores_independientes = [];

    tiInputs.forEach(input => {
        const valor = input.value.trim();
        if (valor === "" || isNaN(valor)) {
            valores_independientes.push(0);
        } else {
            valores_independientes.push(parseFloat(valor));
        }
    });

    if (matriz.length === 0 || valores_independientes.length === 0) {
        alert("Completa la matriz y los términos independientes");
        return;
    }

    // Endpoint
    const endpoint = metodoSeleccionado === "gauss_jordan"
        ? "resolver_gauss_jordan"
        : "resolver_gauss_seidel";

    const url = `http://127.0.0.1:8001/${endpoint}`;
    if (metodoSeleccionado === "gauss_seidel") {
        mostrarEstadoSistema("Calculando...");
    } else {
        limpiarEstadoSistema();
    }

    //  Body
    let body = {
        matriz: matriz,
        valores_independientes: valores_independientes
    };

    if (metodoSeleccionado === "gauss_seidel") {
        body.tolerancia = parseFloat(tolerancia) || 0.0001;
        body.iteraciones = parseInt(iteraciones) || 100;
    }

    try {
        // Llamada a FastAPI
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const solucion = Array.isArray(data) ? data : data.solucion;
        const convergio = typeof data.convergio === "boolean" ? data.convergio : null;

        // Mostrar resultados dinámicamente
        if (!Array.isArray(solucion) || solucion.length === 0) {
            for (let i = 0; i < size; i++) {
                mostrarResultadoSistema(i, "-");
            }
            if (metodoSeleccionado === "gauss_seidel") {
                mostrarEstadoSistema("No se obtuvo solucion", false);
            }
        } else {
            for (let i = 0; i < size; i++) {
                mostrarResultadoSistema(
                    i,
                    solucion[i] !== undefined ? Number(solucion[i]).toFixed(6) : "N/A"
                );
            }

            if (metodoSeleccionado === "gauss_seidel") {
                if (convergio === true) {
                    mostrarEstadoSistema("Convergio", true);
                } else if (convergio === false) {
                    mostrarEstadoSistema(data.mensaje || "No convergio", false);
                }
            }
        }

    } catch (err) {
        const size = parseInt(document.getElementById("matrix-size").value);
        for (let i = 0; i < size; i++) {
            mostrarResultadoSistema(i, "Error");
        }
        if (metodoSeleccionado === "gauss_seidel") {
            mostrarEstadoSistema("No se pudo calcular", false);
        }
    }
}

function generarPuntosRegresion() {
    const cantidad = parseInt(document.getElementById("cantidad-puntos")?.value);
    const tabla = document.querySelector(".points-table tbody");

    if (!tabla) return;

    if (!cantidad || cantidad < 2 || cantidad > 12) {
        alert("Ingresa una cantidad de puntos entre 2 y 12");
        return;
    }

    tabla.innerHTML = "";

    for (let i = 0; i < cantidad; i++) {
        const fila = document.createElement("tr");

        for (const eje of ["x", "y"]) {
            const celda = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.step = "any";
            input.placeholder = `${eje}${i + 1}`;
            celda.appendChild(input);
            fila.appendChild(celda);
        }

        tabla.appendChild(fila);
    }
}

function obtenerPuntosRegresion() {
    const filas = document.querySelectorAll(".points-table tbody tr");
    const puntos = [];

    filas.forEach(fila => {
        const inputs = fila.querySelectorAll("input");
        const x = parseFloat(inputs[0]?.value);
        const y = parseFloat(inputs[1]?.value);

        if (!Number.isNaN(x) && !Number.isNaN(y)) {
            puntos.push([x, y]);
        }
    });

    return puntos;
}

function mostrarResultadoRegresion(data, metodo) {
    const funcion = document.getElementById("result-funcion-regresion");
    const coeficiente = document.getElementById("result-coeficiente-regresion");
    const ajuste = document.getElementById("result-ajuste-regresion");

    if (!funcion || !coeficiente || !ajuste) return;

    funcion.textContent = data["Función"] || data["Funcion"] || "-";
    coeficiente.textContent = data["Porcentaje de efectividad"] ||
        data["Coeficiente de correlación (r)"] ||
        "-";
    ajuste.textContent = data["Efectividad de ajuste"] || "-";

    ajuste.classList.remove("status-ok", "status-error");
    const textoAjuste = ajuste.textContent.toLowerCase();
    if (textoAjuste.includes("no aceptable")) {
        ajuste.classList.add("status-error");
    } else if (textoAjuste.includes("aceptable")) {
        ajuste.classList.add("status-ok");
    }

    if (metodo === "lineal" && coeficiente.textContent !== "-") {
        coeficiente.textContent = `r = ${coeficiente.textContent}`;
    }
}

function obtenerExpresionRegresion(funcion) {
    if (!funcion || !funcion.includes("=")) return "";

    return funcion
        .split("=")
        .slice(1)
        .join("=")
        .trim()
        .replace(/(\d)(x)/g, "$1*$2");
}

function graficarRegresion(puntos, funcion) {
    if (!window.applet || !window.applet.getAppletObject) return;

    const ggb = window.applet.getAppletObject();
    if (!ggb) return;

    const expresion = obtenerExpresionRegresion(funcion);
    if (!expresion) return;

    ggb.reset();

    puntos.forEach((punto, index) => {
        const [x, y] = punto;
        const nombre = `P${index + 1}`;
        ggb.evalCommand(`${nombre} = (${x}, ${y})`);
        ggb.setColor(nombre, 34, 197, 94);
        ggb.setPointSize(nombre, 6);
    });

    ggb.evalCommand(`f(x) = ${expresion}`);
    ggb.setColor("f", 96, 165, 250);
    ggb.setLineThickness("f", 5);
}

async function calcular_regresion() {
    const tolerancia = parseFloat(document.getElementById("tolerancia-regresion")?.value);
    const puntos = obtenerPuntosRegresion();

    if (!metodoSeleccionado) {
        alert("Selecciona un metodo primero");
        return;
    }

    if (metodoSeleccionado !== "lineal" && metodoSeleccionado !== "polinomial") {
        alert("Selecciona un metodo de regresion");
        return;
    }

    if (puntos.length < 2) {
        alert("Carga al menos 2 puntos completos");
        return;
    }

    const body = {
        puntos,
        tolerancia: Number.isNaN(tolerancia) ? 0.8 : tolerancia
    };

    let endpoint = "resolver_regresion_lineal";

    if (metodoSeleccionado === "polinomial") {
        const grado = parseInt(document.getElementById("grado-regresion")?.value);

        if (!grado || grado < 1) {
            alert("Ingresa un grado mayor o igual a 1");
            return;
        }

        if (grado >= puntos.length) {
            alert("El grado debe ser menor que la cantidad de puntos");
            return;
        }

        body.grado = grado;
        endpoint = "resolver_regresion_polinomial";
    }

    const url = `http://127.0.0.1:8001/${endpoint}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (typeof data === "string") {
            throw new Error(data);
        }

        mostrarResultadoRegresion(data, metodoSeleccionado);
        graficarRegresion(puntos, data["Función"] || data["Funcion"]);
    } catch (err) {
        const funcion = document.getElementById("result-funcion-regresion");
        const coeficiente = document.getElementById("result-coeficiente-regresion");
        const ajuste = document.getElementById("result-ajuste-regresion");

        if (funcion) funcion.textContent = "Error al calcular";
        if (coeficiente) coeficiente.textContent = "-";
        if (ajuste) {
            ajuste.textContent = err.message || "No se pudo calcular";
            ajuste.classList.remove("status-ok");
            ajuste.classList.add("status-error");
        }
    }
}

function obtenerExpresionGeogebra(funcion) {
    return funcion
        .trim()
        .replace(/\s+/g, "")
        .replace(/ln\(/g, "log(")
        .replace(/\*\*/g, "^")
        .replace(/([\d)])x/g, "$1*x")
        .replace(/x([\d(])/g, "x*$1")
        .replace(/\)\(/g, ")*(")
        .replace(/\)([a-zA-Z])/g, ")*$1")
        .replace(/\bx\(/g, "x*(");
}
    function toggleFuncion2(checked) {
        const wrapper = document.getElementById("wrapper-funcion2");
        if (!wrapper) return;
        wrapper.style.display = checked ? "block" : "none";
    }

    function graficarIntegracion(funcion1, xi, xd, funcion2) {
        if (!window.applet || !window.applet.getAppletObject) return;

        const ggb = window.applet.getAppletObject();
        if (!ggb) return;

        const expr1 = obtenerExpresionGeogebra(funcion1);

        ggb.reset();
        ggb.evalCommand(`f(x) = ${expr1}`);
        ggb.setColor("f", 96, 165, 250);
        ggb.setLineThickness("f", 5);

        if (funcion2) {
            const expr2 = obtenerExpresionGeogebra(funcion2);
            ggb.evalCommand(`g(x) = ${expr2}`);
            ggb.setColor("g", 239, 68, 68);
            ggb.setLineThickness("g", 4);

            ggb.evalCommand(`h(x) = f(x) - g(x)`);

            ggb.evalCommand(`A = (${xi}, 0)`);
            ggb.evalCommand(`B = (${xd}, 0)`);
            ggb.evalCommand(`area = Integral(h, ${xi}, ${xd})`);

            ggb.setColor("A", 34, 197, 94);
            ggb.setColor("B", 34, 197, 94);
            ggb.setPointSize("A", 6);
            ggb.setPointSize("B", 6);
            ggb.setColor("area", 34, 197, 94);
            ggb.setFilling("area", 0.35);
        } else {
            ggb.evalCommand(`A = (${xi}, 0)`);
            ggb.evalCommand(`B = (${xd}, 0)`);
            ggb.evalCommand(`area = Integral(f, ${xi}, ${xd})`);

            ggb.setColor("A", 34, 197, 94);
            ggb.setColor("B", 34, 197, 94);
            ggb.setPointSize("A", 6);
            ggb.setPointSize("B", 6);
            ggb.setColor("area", 34, 197, 94);
            ggb.setFilling("area", 0.35);
        }
    }

function metodoIntegracionRequiereN(metodo) {
    return ["trapecios_multiple", "simpson_1_3_multiple", "simpson_combinado"].includes(metodo);
}

async function calcular_integracion() {
    const funcion = document.getElementById("funcion-integracion")?.value.trim();
    const usarFuncion2 = document.getElementById("enable-funcion-2")?.checked;
    const funcion2 = document.getElementById("funcion2-integracion")?.value.trim();
    const xi = parseFloat(document.getElementById("xi-integracion")?.value);
    const xd = parseFloat(document.getElementById("xd-integracion")?.value);
    const n = parseInt(document.getElementById("n-integracion")?.value);
    const metodo = document.getElementById("metodo-integracion")?.value;
    const areaElement = document.getElementById("result-area-integracion");

    if (!funcion || Number.isNaN(xi) || Number.isNaN(xd) || !metodo) {
        alert("Completa funcion, Xi, Xd y metodo");
        return;
    }

    if (usarFuncion2 && !funcion2) {
        alert("Activa y completa la segunda función o desactiva la opción");
        return;
    }

    if (metodoIntegracionRequiereN(metodo) && (!n || n <= 0)) {
        alert("Ingresa una cantidad de subintervalos mayor a 0");
        return;
    }

    if (metodo === "simpson_1_3_multiple" && n % 2 !== 0) {
        alert("Simpson 1/3 multiple requiere n par");
        return;
    }

    // si hay segunda funcion, se compone la funcion que integra f-g
    const funcionEnvio = usarFuncion2 ? `(${funcion})-(${funcion2})` : funcion;
    const body = { funcion: funcionEnvio, xi, xd, metodo };
    if (!Number.isNaN(n)) {
        body.n = n;
    }

    try {
        const response = await fetch("http://127.0.0.1:8001/resolver_integracion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (areaElement) {
            areaElement.textContent = Math.abs(Number(data.area)).toFixed(6);
            areaElement.classList.remove("status-error");
            areaElement.classList.add("status-ok");
        }

        graficarIntegracion(funcion, xi, xd, usarFuncion2 ? funcion2 : null);
    } catch (err) {
        if (areaElement) {
            areaElement.textContent = err.message || "No se pudo calcular";
            areaElement.classList.remove("status-ok");
            areaElement.classList.add("status-error");
        }
    }
}
