function salvarPersonagem(event) {
    // 1. Impede a página de recarregar por causa do comportamento padrão do formulário (submit)
    event.preventDefault();

    // 2. Captura as informações básicas do personagem
    const nome = document.getElementById('name').value;
    const sexo = document.getElementById('sex').value;
    const classe = document.getElementById('class').value;
    const dadiva = document.getElementById('gift').value;
    const vidaMax = document.getElementById('health').value;
    const nivel = document.getElementById('level').value;

    // Validação de segurança: Não deixa salvar se o campo nome estiver vazio
    if (!nome.trim()) {
        alert("Por favor, preencha o Nome do personagem antes de salvar!");
        return;
    }

    // 3. Captura detalhada de todos os atributos e modificadores
    const personagem = {
        id: Date.now(), // ID único baseado no carimbo de data/hora
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

    // 4. Salva a lista de fichas no banco de dados do navegador (localStorage)
    let bancoFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    bancoFichas.push(personagem);
    localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));

    alert(`Sucesso! A ficha de ${nome} foi enviada para "Minhas Fichas".`);

    // 5. Redireciona o usuário para a página de listagem
    window.location.href = 'minhasFichas.html';
}

// EXPÕE A FUNÇÃO PARA O ESCOPO GLOBAL: Resolve o conflito com type="module"
window.salvarPersonagem = salvarPersonagem;
