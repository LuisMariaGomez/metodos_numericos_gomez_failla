let metodoSeleccionado = '';
let applet;

function seleccionarMetodo(metodo, boton) {
    metodoSeleccionado = metodo;
    const botones = document.querySelectorAll('.metodo-btn');
    botones.forEach(b => b.classList.remove('selected'));
    if (boton) {
        boton.classList.add('selected');
    }
}
/* GAUSS SEIDEL Y JORDAN */
async function calcular_sistema() {

    const tolerancia = document.getElementById("tolerancia").value.trim();
    const iteraciones = document.getElementById("iteraciones").value.trim();

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

        //  Mostrar resultados
        if (!data || data.length === 0) {
            document.getElementById("result-x").textContent = "-";
            document.getElementById("result-y").textContent = "-";
            document.getElementById("result-z").textContent = "Sin resultado";
        } else {
            document.getElementById("result-x").textContent =
                data[0] !== undefined ? Number(data[0]).toFixed(6) : "N/A";

            document.getElementById("result-y").textContent =
                data[1] !== undefined ? Number(data[1]).toFixed(6) : "N/A";

            document.getElementById("result-z").textContent =
                data[2] !== undefined ? Number(data[2]).toFixed(6) : "N/A";
        }

    } catch (err) {
        document.getElementById("result-x").textContent = "Error";
        document.getElementById("result-y").textContent = "No conecta";
        document.getElementById("result-z").textContent = err.message || "";
    }
}

function init() {
    let params = {
        appName: "graphing",
        width: 1650,
        height: 900,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false
    };

    applet = new GGBApplet(params, true);
    window.applet = applet; // Hacerlo global para que main.js lo use
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
window.onload = init;

document.getElementById("optimizar-btn").addEventListener("click", generarMatriz);

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
    const botones = document.createElement("div");
    botones.classList.add("button-grid");

    botones.innerHTML = `
        <button class="metodo-btn" onclick="seleccionarMetodo('gauss_jordan', this)">Gauss-Jordan</button>
        <button class="metodo-btn" onclick="seleccionarMetodo('gauss_seidel', this)">Gauss-Seidel</button>
    `;

    resultContainer.appendChild(botones);
}
