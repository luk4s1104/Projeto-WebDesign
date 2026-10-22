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
    const quantidade = qtdDados.value;    // pega a qtd de dados
    const lados = nLados.value;   // pega qual e o dado
    const comandoRpg = `${quantidade}d${lados}`; // ex: 3d12
    lancar.disabled = true; // 1. Trava o botão 
    const resultados = await box.roll(comandoRpg); // 2. Espera os dados girarem
    let somaTotal = 0;
    resultados.forEach(dado => {
        somaTotal += dado.value;  // soma o resultado
    });
    totalR.textContent = somaTotal; // mostra na tela
    lancar.disabled = false; // 3. Destrava o botão aqui
});
