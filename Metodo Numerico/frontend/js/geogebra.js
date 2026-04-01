let applet;
let metodoSeleccionado = '';

function seleccionarMetodo(metodo) {
    metodoSeleccionado = metodo;
    // Opcional: cambiar estilo de botones para mostrar selección
}

function crearApplet(){
    let params = {
        appName: "graphing",
        width: 600,
        height: 400,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false
    };

    applet = new GGBApplet(params, true);
    applet.inject("grafico");
}

window.onload = crearApplet;

async function graficar() {

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
        url = `http://127.0.0.1:8000/resolver_abiertos?expr=${expr}&x1=${x1}&x2=${x2}&iteraciones=${iteraciones}&tolerancia=${tolerancia}&metodo=${metodoSeleccionado}`;
    } else {
        url = `http://127.0.0.1:8000/resolver_cerrados?expr=${expr}&x1=${x1}&x2=${x2}&iteraciones=${iteraciones}&tolerancia=${tolerancia}&metodo=${metodoSeleccionado}`;
    }

    try {
        // Llamada a FastAPI
        const response = await fetch(url);
        const data = await response.json();

        // Mostrar resultados en pantalla
        if (data.error) {
            document.getElementById("iteraciones").textContent = "Error";
            document.getElementById("raiz").textContent = data.error;
            document.getElementById("error").textContent = "";
        } else {
            document.getElementById("iteraciones").textContent = data.iteracion !== undefined ? data.iteracion : data.iteración || "N/A";
            document.getElementById("raiz").textContent = data.raiz !== undefined ? data.raiz.toFixed(6) : "N/A";
            document.getElementById("error").textContent = data.error !== undefined ? data.error.toFixed(6) : "N/A";
        }

    } catch (err) {
        document.getElementById("iteraciones").textContent = "Error";
        document.getElementById("raiz").textContent = "No se pudo conectar con la API";
        document.getElementById("error").textContent = "";
    }

    // borrar gráfico anterior
    if (applet && applet.getAppletObject()) {
        applet.getAppletObject().reset();
        // graficar función
        applet.getAppletObject().evalCommand("f(x) = " + decodeURIComponent(expr));
    }
}
