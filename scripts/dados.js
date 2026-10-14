const qtdDados = document.getElementById("dice-count")
const nLados = document.getElementById("dice-sides")
const lancar = document.getElementById("lauch")
const totalR = document.getElementById("total")
const diceGrid = document.querySelector(".dice-grid")

lancar.addEventListener('click', () => {
    const quantidade = parseInt(qtdDados.value)
    const lados = parseInt(nLados.value)

    lancar.disabled = true

    diceGrid.innerHTML = ""
    diceGrid.className = "dice-grid"

    if (quantidade === 4) {
        diceGrid.classList.add("dados-4")
    } else if (quantidade === 6) {
        diceGrid.classList.add("dados-6")
    }

    for(let i  = 0; i < quantidade; i ++){
        const novoDadoMockup = document.createElement("div")
        novoDadoMockup.classList.add("dice-mockup", "dice-rolling")

        const novoNumero = document.createElement("span")
        novoNumero.classList.add("main-value")
        novoNumero.textContent = ""

        novoDadoMockup.appendChild(novoNumero)
        diceGrid.appendChild(novoDadoMockup)
    }

    const todosOsNumeros = document.querySelectorAll(".main-value")
    const animacao = setInterval( () => {
        todosOsNumeros.forEach(num => {
            num.textContent = Math.floor(Math.random() * lados) + 1
        })
    }, 50)

setTimeout( ()=>{
    clearInterval(animacao)
    lancar.disabled = false

    let somaTotal = 0

    const todosOsNumeros = document.querySelectorAll(".dice-mockup")

    todosOsNumeros.forEach((dadoCriado, index) => {

        dadoCriado.classList.remove("dice-rolling")

        const resultadoIndividual = Math.floor(Math.random() * lados) + 1
        somaTotal += resultadoIndividual

        const spanNumero = dadoCriado.querySelector(".main-value")
        spanNumero.textContent = resultadoIndividual
    })

    totalR.textContent = somaTotal

    }, 500)
})