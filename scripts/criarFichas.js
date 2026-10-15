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

    const personagem = {
        id: Date.now(),
        info: { nome, sexo, classe, dadiva, vidaMax, nivel },
        atributos: {
            vitality: {
                base: document.getElementById('vitality').value || "0",
                mod: document.querySelector('input[name="vitalityMod"]').value || "0",
                modLevel: document.querySelector('input[name="vitalityModLevel"]').value || "0"
            },
            strength: {
                base: document.getElementById('strength').value || "0",
                mod: document.querySelector('input[name="strengthMod"]').value || "0",
                modLevel: document.querySelector('input[name="strengthModLevel"]').value || "0"
            },
            dexterity: {
                base: document.getElementById('dexterity').value || "0",
                mod: document.querySelector('input[name="dexterityMod"]').value || "0",
                modLevel: document.querySelector('input[name="strengthModLevel"]').value || "0"
            },
            resistence: {
                base: document.getElementById('resistence').value || "0",
                mod: document.querySelector('input[name="resistenceMod"]').value || "0",
                modLevel: document.querySelector('input[name="resistenceModLevel"]').value || "0"
            },
            intelligence: {
                base: document.getElementById('intelligence').value || "0",
                mod: document.querySelector('input[name="intelligenceMod"]').value || "0",
                modLevel: document.querySelector('input[name="intelligenceModLevel"]').value || "0"
            },
            faith: {
                base: document.getElementById('faith').value || "0",
                mod: document.querySelector('input[name="faithMod"]').value || "0",
                modLevel: document.querySelector('input[name="faithModLevel"]').value || "0"
            },
            humanity: document.getElementById('humanity').value || "0"
        }
    };

    let bancoFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    bancoFichas.push(personagem);
    localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));

    // Ativa o pop-up na tela
    const alerta = document.getElementById('personagemCriadoAlerta');
    if (alerta) {
        alerta.classList.remove('closed');
        alerta.classList.add('open');
    }

    // Redireciona após 2.5 segundos
    setTimeout(() => {
        window.location.href = 'minhasFichas.html';
    }, 3500);
}

function fecharAlerta() {
    const alerta = document.getElementById('personagemCriadoAlerta');
    if (alerta) {
        alerta.classList.remove('open');
        alerta.classList.add('closed');
    }
}

window.salvarPersonagem = salvarPersonagem;
window.fecharAlerta = fecharAlerta;