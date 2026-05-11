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

function init() {
    if (typeof GGBApplet === "undefined") return; // 👈 clave

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
    applet.inject("grafico");
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
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

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
        document.getElementById("result-iteraciones").textContent = "Error";
        document.getElementById("result-raiz").textContent = "No se pudo conectar con la API";
        document.getElementById("result-error").textContent = err.message || "";
    }

    // borrar gráfico anterior
    if (window.applet && window.applet.getAppletObject()) {
        window.applet.getAppletObject().reset();
        // graficar función
        window.applet.getAppletObject().evalCommand("f(x) = " + expr);
    }
}
window.onload = () => {
    if (document.getElementById("grafico")) {
        init();
    }
};

document.getElementById("optimizar-btn")?.addEventListener("click", generarMatriz);

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
