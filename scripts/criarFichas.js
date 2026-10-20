let idCronometroRedirecionamento = null;

function salvarPersonagem(event) {
    event.preventDefault();

    const nome = document.getElementById('name').value;
    const sexo = document.getElementById('sex').value;
    const classe = document.getElementById('class').value;
    const dadiva = document.getElementById('gift').value;
    const vidaMax = document.getElementById('health').value;
    const nivel = document.getElementById('level').value;

    if (!nome.trim()) {
        alert("Por favor, preencha o Nome do personagem antes de salvar!");
        return;
    }
    if (!classe.trim()){
        alert("Por favor, preencha a Classe do personagem antes de salvar!");
        return;
    }

    const personagem = {
        id: Date.now(),
        info: { nome, sexo, classe, dadiva, vidaMax, nivel },
                atributos: {
            vitality: {
                base: document.getElementById('vitality').value || "0",
                mod: document.querySelector('input[name="vitalityMod"]').value || "0",
                modLevel: document.querySelector('div[data-name="vitalityModLevel"]').textContent || "0"
            },
            strength: {
                base: document.getElementById('strength').value || "0",
                mod: document.querySelector('input[name="strengthMod"]').value || "0",
                modLevel: document.querySelector('div[data-name="strengthModLevel"]').textContent || "0"
            },
            dexterity: {
                base: document.getElementById('dexterity').value || "0",
                mod: document.querySelector('input[name="dexterityMod"]').value || "0",
                modLevel: document.querySelector('div[data-name="dexterityModLevel"]').textContent || "0"
            },
            resistence: {
                base: document.getElementById('resistence').value || "0",
                mod: document.querySelector('input[name="resistenceMod"]').value || "0",
                modLevel: document.querySelector('div[data-name="resistenceModLevel"]').textContent || "0"
            },
            intelligence: {
                base: document.getElementById('intelligence').value || "0",
                mod: document.querySelector('input[name="intelligenceMod"]').value || "0",
                modLevel: document.querySelector('div[data-name="intelligenceModLevel"]').textContent || "0"
            },
            faith: {
                base: document.getElementById('faith').value || "0",
                mod: document.querySelector('input[name="faithMod"]').value || "0",
                modLevel: document.querySelector('div[data-name="faithModLevel"]').textContent || "0"
            },
            humanity: document.getElementById('humanity').value || "0"
        }
    };

    let bancoFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    bancoFichas.push(personagem);
    localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));

    document.getElementById('formBox').reset();

    // Ativa o pop-up na tela
    const alerta = document.getElementById('personagemCriadoAlerta');
    if (alerta) {
        alerta.classList.remove('closed');  // remove a classe que o deixa incisivel
        alerta.classList.add('open');       // adiciona uma classe que o torna visivel
    }

    // Inicia o cronômetro de 3.5 segundos e salva seu ID para podermos cancelá-lo depois se o "X" for clicado
    idCronometroRedirecionamento = setTimeout(() => {
        window.location.href = 'minhasFichas.html';
    }, 3500);
}

function fecharAlerta() {
    const alerta = document.getElementById('personagemCriadoAlerta');
    if (alerta) { // Se o pop-up realmente existir na página
        alerta.classList.remove('open'); // tira a classe que o deixava visivel
        alerta.classList.add('closed'); // coloca uma classe para deixar o popup invisivel
    }
    if(idCronometroRedirecionamento){  // Se houver algum cronômetro de redirecionamento rodando na memória
        clearTimeout(idCronometroRedirecionamento); 
        console.log("Redirecionamento cancelado pelo usuário");
    }
}

window.salvarPersonagem = salvarPersonagem;
window.fecharAlerta = fecharAlerta;

// Aguarda a página HTML carregar totalmente os elementos na tela
document.addEventListener('DOMContentLoaded', () => {
    
    const atributos = ['vitality', 'strength', 'dexterity', 'resistence', 'intelligence', 'faith'];  // lista com os ids dos inputs das caracteristicas

    function calcularAtributoTotal(nomeAtributo){

        const inputBase = document.getElementById(nomeAtributo);  //1. capta o level
        const inputMod = document.querySelector(`input[name="${nomeAtributo}Mod"]`);

        // 2. Localiza as caixas de MOD e MOD+NÍVEL (usando o atributo 'name' do HTML)
        const campoDivTotal = document.querySelector(`div[data-name="${nomeAtributo}ModLevel"]`);

        // Verifica se todas as três caixas daquela linha existem na tela antes de somar
        if (inputBase && inputMod && campoDivTotal) {
            // Captura os valores digitados (converte para número inteiro ou usa 0 se estiver vazio)
            const valorBase = parseInt(inputBase.value, 10) || 0;
            const valorMod = parseInt(inputMod.value, 10) || 0;
            
            // Realiza a soma do valor da característica + o modificador dela
            campoDivTotal.textContent = valorBase + valorMod;
        }
    }

    // Passa de linha em linha criando os escutadores de eventos para atualização instantânea
    atributos.forEach(attr => {
        const inputBase = document.getElementById(attr);
        const inputMod = document.querySelector(`input[name="${attr}Mod"]`);
        
        // 1: Se o usuário mudar o valor base da característica, recalcula a linha
        if (inputBase) {
            inputBase.addEventListener('input', () => calcularAtributoTotal(attr));
        }
        
        // 2: Se o usuário mudar o modificador (MOD) da característica, recalcula a linha
        if (inputMod) {
            inputMod.addEventListener('input', () => calcularAtributoTotal(attr));
        }
    });
    // Roda a função uma vez no início para calcular os valores padrões da página (0 + 0)
    atributos.forEach(attr => calcularAtributoTotal(attr));
});
