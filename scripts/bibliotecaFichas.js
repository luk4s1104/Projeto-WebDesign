import loader from './components/loader.js';
import { abrirModalVisualizacao } from './components/modalController.js';
import { carregarComponenteModal, bindFilterInputs, matchFilterRules } from './utils/filterController.js';

let idCronometroAlerta = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega o header e footer globais
    if (typeof loader === 'function') {
        await loader();
    }

    // 2. Injeta a estrutura física invisível do modal (Usa a nossa utilidade compartilhada!)
    await carregarComponenteModal("../pages/components.html");

    // 3. Vincula a inteligência de clique nas fichas estáticas da comunidade
    configurarCliquesBiblioteca();

    // 4. Ativa os ouvintes de evento para monitorar a digitação (Usa a nossa utilidade compartilhada!)
    bindFilterInputs(aplicarFiltros);
});

// Lê os dados inseridos de forma estática no HTML e configura as ações dos botões
function configurarCliquesBiblioteca() {
    const cards = document.querySelectorAll('.char-card');
    
    cards.forEach(card => {
        // Extrai e limpa os dados contidos nas tags HTML do card para podermos ler depois
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

        // Monta o objeto de dados temporário idêntico ao modelo do banco
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

        // Salva esse objeto na própria tag HTML do card! Isso vai facilitar muito a nossa busca no filtro
        card.dataset.characterData = JSON.stringify(personagemObjeto);

        // Vincula a ação de clique do botão "Visualizar"
        const btnVisualizar = card.querySelector('.library-actions button:nth-child(1)');
        if (btnVisualizar) {
            btnVisualizar.onclick = () => abrirModalVisualizacao(personagemObjeto, 'biblioteca', false);
        }

        // Vincula a ação de clique do botão "Clonar Ficha"
        const btnClonar = card.querySelector('.btn-clone');
        if (btnClonar) {
            btnClonar.onclick = () => clonarFichaParaPainel(personagemObjeto);
        }
    });
}

// Salva a ficha clonada no localStorage do usuário
function clonarFichaParaPainel(personagemObjeto) {
    let minhasFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    const novaFicha = { ...personagemObjeto, id: Date.now() }; // Gera um ID único e real
    minhasFichas.push(novaFicha);
    localStorage.setItem('fichasRPG', JSON.stringify(minhasFichas));
    mostrarAlertaClonado(personagemObjeto.info.nome);
}

// Lógica que varre os elementos estáticos ocultando-os se não passarem na regra do filtro
function aplicarFiltros() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (!inputPesquisar || !inputClasse || !inputNivel) return;

    // Padroniza as strings digitadas pelo usuário
    const termoBusca = inputPesquisar.value.toLowerCase().trim();
    const termoClasse = inputClasse.value.toLowerCase().trim();
    const termoNivel = inputNivel.value.trim();

    const cards = document.querySelectorAll('.char-card');
    let cardsVisiveis = 0;

    cards.forEach(card => {
        // Recupera o objeto de dados que guardamos dentro do card no passo anterior
        if (!card.dataset.characterData) return;
        const personagem = JSON.parse(card.dataset.characterData);

        // Executa a nossa regra de matemática matemática compartilhada do filterController!
        const passaNoFiltro = matchFilterRules(personagem, termoBusca, termoClasse, termoNivel);

        if (passaNoFiltro) {
            card.classList.remove('hidden'); // Mostra o card se passar
            cardsVisiveis++;
        } else {
            card.classList.add('hidden');    // Esconde o card se falhar
        }
    });

    // Atualiza o contador de fichas disponíveis no topo da página
    atualizarContadorBiblioteca(cardsVisiveis);
}

// Atualiza o texto do contador no cabeçalho de forma segura
function atualizarContadorBiblioteca(quantidade) {
    const contador = document.querySelector('.panel-header small');
    if (contador) {
        contador.textContent = `FICHAS DISPONÍVEIS (${quantidade})`;
    }
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