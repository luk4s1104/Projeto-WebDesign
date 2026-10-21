let idCronometroRedirecionamento = null;

function salvarPersonagem(event) {
    event.preventDefault();

    // 1. Coleta das informações biográficas principais
    const nome = document.getElementById('name').value;
    const sexo = document.getElementById('sex').value;
    const classe = document.getElementById('class').value;
    const dadiva = document.getElementById('gift').value;
    const vidaMax = document.getElementById('health').value;
    const nivel = document.getElementById('level').value;

    // 2. Validações obrigatórias de segurança antes do envio
    if (!nome.trim()) {
        alert("Por favor, preencha o Nome do personagem antes de salvar!");
        return;
    }
    if (!classe.trim()){
        alert("Por favor, preencha a Classe do personagem antes de salvar!");
        return;
    }

    // 3. Coleta dos blocos de textos longos (Injetados a partir das textareas do bottomSection)
    const feiticos = document.getElementById('spells').value;
    const equipamento = document.getElementById('equipment').value;
    const itensMochila = document.getElementById('items').value;

    // 4. Montagem estruturada do objeto Personagem alinhado ao padrão da dashboard
    const personagem = {
        id: Date.now(), // Gera um ID único em formato numérico timestamp
        info: { 
            nome, 
            sexo, 
            classe, 
            dadiva, 
            vidaMax, 
            nivel,
            // Guardamos a imagem padrão genérica caso o usuário não envie uma customizada
            imagem: "../Img_folder/generico.jpg" 
        },
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
                modLevel: document.querySelector('input[name="dexterityModLevel"]').value || "0"
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
        },
        detalhes: {
            feiticos,
            equipamento,
            itensMochila
        }
    };

    // 5. Envio e persistência segura no localStorage do navegador
    let bancoFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    bancoFichas.push(personagem);
    localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));

    // 6. Reseta o formulário original da página
    document.getElementById('formBox').reset();

    // 7. Ativa e dispara visualmente o pop-up de alerta de sucesso na tela
    const alerta = document.getElementById('personagemCriadoAlerta');
    if (alerta) {
        alerta.classList.remove('closed');  
        alerta.classList.add('open');       
    }

    // 8. Cronômetro de redirecionamento automático de 3.5 segundos para a aba de listagem
    idCronometroRedirecionamento = setTimeout(() => {
        window.location.href = 'minhasFichas.html';
    }, 3500);
}

function fecharAlerta() {
    const alerta = document.getElementById('personagemCriadoAlerta');
    if (alerta) { 
        alerta.classList.remove('open'); 
        alerta.classList.add('closed'); 
    }
    if (idCronometroRedirecionamento) {  
        clearTimeout(idCronometroRedirecionamento); 
        console.log("Redirecionamento automático cancelado pelo usuário.");
    }
}

// Vincula os escopos das funções ao objeto global window do navegador
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