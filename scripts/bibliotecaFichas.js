import loader from './loader.js';
import { abrirModalVisualizacao } from './modalController.js';

let idCronometroAlerta = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega o header e footer globais
    if (typeof loader === 'function') {
        await loader();
    }

    // 2. Injeta a estrutura física invisível do modal na página corrente
    await carregarComponenteModal();

    // 3. Vincula a inteligência de clique nas fichas estáticas da comunidade
    configurarCliquesBiblioteca();

    // 4. Inicializa os ouvintes de eventos para os filtros da biblioteca
    inicializarFiltrosBiblioteca();
});

async function carregarComponenteModal() {
    try {
        const response = await fetch("../pages/components.html");
        const htmlText = await response.text();
        const parser = new DOMParser();
        const docVirtual = parser.parseFromString(htmlText, "text/html");
        
        const modalTemplate = docVirtual.getElementById('comp-modal-ficha');
        if (modalTemplate) {
            document.body.appendChild(modalTemplate.cloneNode(true));
        }
    } catch (error) {
        console.error("Erro ao pré-carregar modal de componentes na biblioteca:", error);
    }
}

function configurarCliquesBiblioteca() {
    const cards = document.querySelectorAll('.char-card');
    
    cards.forEach(card => {
        const nome = card.querySelector('h4').textContent;
        const autor = card.querySelector('.char-subtitle').textContent;
        const nivelTexto = card.querySelector('.char-level').textContent;
        const nivel = nivelTexto.replace('Nvl ', '').trim();
        const classe = card.querySelector('figcaption').textContent;
        const vidaTexto = card.querySelector('.hp-label').textContent;
        const vidaMax = vidaTexto.replace('VIDA: ', '').trim();

        const imagemUrl = card.querySelector('.char-avatar img').getAttribute('src');
        
        const celulas = card.querySelectorAll('.stats-table tbody td');
        const itemLista = card.querySelector('.equip-list li')?.textContent || '';

        const personagemObjeto = {
            id: 'publico',
            info: { nome, classe, nivel, vidaMax, dadiva: itemLista , imagem: imagemUrl},
            atributos: {
                vitality: { base: celulas[0]?.textContent || 0 },
                strength: { base: celulas[1]?.textContent || 0 },
                dexterity: { base: celulas[2]?.textContent || 0 },
                resistence: { base: celulas[3]?.textContent || 0 },
                intelligence: { base: celulas[4]?.textContent || 0 },
                faith: { base: celulas[5]?.textContent || 0 },
                humanity: celulas[6]?.textContent || 0
            }
        };

        const btnVisualizar = card.querySelector('.library-actions button:nth-child(1)');
        if (btnVisualizar) {
            btnVisualizar.onclick = () => abrirModalVisualizacao(personagemObjeto, 'biblioteca', false);
        }

        const btnClonar = card.querySelector('.btn-clone');
        if (btnClonar) {
            btnClonar.onclick = () => {
                let minhasFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
                const novaFicha = { ...personagemObjeto, id: Date.now() };
                minhasFichas.push(novaFicha);
                localStorage.setItem('fichasRPG', JSON.stringify(minhasFichas));

                mostrarAlertaClonado(nome);
            };
        }
    });
}

// ==========================================================================
// SISTEMA DE FILTROS DA BIBLIOTECA PÚBLICA
// ==========================================================================

function aplicarFiltrosBiblioteca() {
    // Captura os elementos do formulário de filtros pelos IDs corretos
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (!inputPesquisar || !inputClasse || !inputNivel) return;

    // Padroniza os termos digitados pelo usuário (remover espaços e colocar em minúsculo)
    const termoBusca = inputPesquisar.value.toLowerCase().trim();
    const termoClasse = inputClasse.value.toLowerCase().trim();
    const termoNivel = inputNivel.value.trim();

    // Seleciona todos os cards físicos desenhados na tela
    const cards = document.querySelectorAll('.cards-grid .char-card');
    let cardsVisiveis = 0;

    cards.forEach(card => {
        // Extrai as informações de texto de dentro de cada card
        const nomeCard = card.querySelector('h4').textContent.toLowerCase();
        const autorCard = card.querySelector('.char-subtitle').textContent.toLowerCase();
        const classeCard = card.querySelector('figcaption').textContent.toLowerCase();
        
        const nivelTexto = card.querySelector('.char-level').textContent;
        const nivelCard = parseInt(nivelTexto.replace('Nvl ', '').trim(), 10) || 0;

        // Regra 1: O "search" pode ler tanto o Nome do Personagem QUANTO o Criador (@autor)
        const bateBusca = termoBusca === '' || nomeCard.includes(termoBusca) || autorCard.includes(termoBusca);
        
        // Regra 2: Filtragem por classe por correspondência de texto
        const bateClasse = termoClasse === '' || classeCard.includes(termoClasse);

        // Regra 3: Filtragem por nível igual ou maior ao digitado
        const bateNivel = termoNivel === '' || nivelCard >= parseInt(termoNivel, 10);

        // Condição final: o card precisa passar em todos os filtros ativos
        if (bateBusca && bateClasse && bateNivel) {
            card.style.display = ""; // Mostra o card
            cardsVisiveis++;
        } else {
            card.style.display = "none"; // Esconde o card
        }
    });

    // Atualiza dinamicamente o contador do painel superior com o número de fichas encontradas
    const contador = document.querySelector('.panel-header small');
    if (contador) {
        contador.textContent = `FICHAS DISPONÍVEIS (${cardsVisiveis})`;
    }
}

// Vincula os escutadores de digitação em tempo real (evento 'input')
function inicializarFiltrosBiblioteca() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (inputPesquisar) inputPesquisar.addEventListener('input', aplicarFiltrosBiblioteca);
    if (inputClasse) inputClasse.addEventListener('input', aplicarFiltrosBiblioteca);
    if (inputNivel) inputNivel.addEventListener('input', aplicarFiltrosBiblioteca);
}

function mostrarAlertaClonado(nomePersonagem) {
    const alerta = document.getElementById('personagemClonadoAlerta');
    const texto = document.getElementById('textoAlertaClonado');
    
    if (alerta && texto) {
        // Altera o texto dinamicamente para mostrar o nome da ficha que você clonou
        texto.textContent = `A ficha do(a) ${nomePersonagem} foi clonada com sucesso!`;
        
        // Acende o pop-up na tela tirando o 'closed' e colocando 'open'
        alerta.classList.remove('closed');
        alerta.classList.add('open');
        
        // Se o usuário clicar em clonar rápido várias vezes, cancela o tempo do clique anterior
        if (idCronometroAlerta) clearTimeout(idCronometroAlerta);
        
        // Inicia a contagem de 3.5 segundos para esconder o pop-up sozinho
        idCronometroAlerta = setTimeout(() => {
            fecharAlertaClonado();
        }, 3500);
    }
}

function fecharAlertaClonado() {
    const alerta = document.getElementById('personagemClonadoAlerta');
    if (alerta) {
        // Apaga o pop-up da tela invertendo as classes CSS
        alerta.classList.remove('open');
        alerta.classList.add('closed');
    }
    // Desliga o relógio se o usuário clicou no "X" antes do tempo acabar
    if (idCronometroAlerta) {
        clearTimeout(idCronometroAlerta);
        idCronometroAlerta = null; // Esvazia a variável de segurança
    }
}

// Vincula a função à janela global para o botão "X" do HTML conseguir disparar o clique
window.fecharAlertaClonado = fecharAlertaClonado;

window.mostrarAlertaClonado = mostrarAlertaClonado;
window.fecharAlertaClonado = fecharAlertaClonado;