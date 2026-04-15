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
