let applet;

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

function graficar(){

    let expr = document.getElementById("expr_str").value;

    // borrar gráfico anterior
    ggbApplet.reset();
    // graficar función
    applet.getAppletObject().evalCommand("f(x) = " + expr);
}
