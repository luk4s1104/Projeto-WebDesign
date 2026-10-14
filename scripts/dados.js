import DiceBox from "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js";

const qtdDados = document.getElementById("dice-count");
const nLados = document.getElementById("dice-sides");
const lancar = document.getElementById("lauch");
const totalR = document.getElementById("total");

const box = new DiceBox(".dice-grid", {
    id: "dice-canvas",
    assetPath: "assets/",
    origin: "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/",
    theme: "default",
    themeColor: "#2e1cd4",
    offscreen: false,
    scale: 10,
    throwForce: 3,
    gravity: 1.8
});

box.init()

lancar.addEventListener("click", async () => {
    const quantidade = qtdDados.value;
    const lados = nLados.value;
    const comandoRpg = `${quantidade}d${lados}`;
    lancar.disabled = true;
    const resultados = await box.roll(comandoRpg);
    let somaTotal = 0;
    resultados.forEach(dado => {
        somaTotal += dado.value;
    });
    totalR.textContent = somaTotal;
    lancar.disabled = false;
});
