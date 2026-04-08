let metodoSeleccionado = '';
let applet;

function seleccionarMetodo(metodo) {
    metodoSeleccionado = metodo;
}

function init() {
    let params = {
        appName: "graphing",
        width: 600,
        height: 400,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false
    };

    applet = new GGBApplet(params, true);
    window.applet = applet; // Hacerlo global para que main.js lo use
    applet.inject("grafico");
}

async function graficar_y_calcular() {

    // Tomar valores del form
    const expr = encodeURIComponent(document.getElementById("expr_str").value);
    const x1 = document.getElementById("x1").value;
    const x2 = document.getElementById("x2").value;
    const iteraciones = document.getElementById("iteraciones").value;
    const tolerancia = document.getElementById("tolerancia").value;

    if (!metodoSeleccionado) {
        alert("Selecciona un método primero");
        return;
    }

    let url;
    if (metodoSeleccionado === "secante" || metodoSeleccionado === "tangente") {
        url = `http://127.0.0.1:8001/resolver_abiertos?expr=${expr}&x1=${x1}&x2=${x2}&iteraciones=${iteraciones}&tolerancia=${tolerancia}&metodo=${metodoSeleccionado}`;
    } else {
        url = `http://127.0.0.1:8001/resolver_cerrados?expr=${expr}&x1=${x1}&x2=${x2}&iteraciones=${iteraciones}&tolerancia=${tolerancia}&metodo=${metodoSeleccionado}`;
    }

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
        window.applet.getAppletObject().evalCommand("f(x) = " + decodeURIComponent(expr));
    }
}
window.onload = init;