const qtdDados = document.getElementById("dice-count")
const nLados = document.getElementById("dice-sides")
const dado = document.getElementById("dice")
const lancar = document.getElementById("lauch")
const totalR = document.getElementById("total")

lancar.addEventListener('click', () => {
    const quantidade = parseInt(qtdDados.value)
    const lados = parseInt(nLados.value)

    lancar.disabled = true

    dado.classList.add("dice-rolling")

    const animacao = setInterval( () =>{
        dado.textContent = Math.floor(Math.random() * lados) + 1
    }, 50)

setTimeout( ()=>{

    clearInterval(animacao)

    dado.classList.remove("dice-rolling")

    lancar.disabled = false

    let somaTotal = 0
    let ultimoResultado = 0

    for(let i = 0; i < quantidade; i++){
    const resultado = Math.floor(Math.random() * lados) + 1

    somaTotal += resultado
    ultimoResultado = resultado
    }

    dado.textContent = ultimoResultado

    totalR.textContent = somaTotal
    }, 500)
})