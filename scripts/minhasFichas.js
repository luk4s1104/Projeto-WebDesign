import loader from './loader.js';
import { abrirModalVisualizacao } from './modalController.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega os componentes estáticos globais (header/footer) se a função existir
    if (typeof loader === 'function') {
        await loader();
    }
    
    // 2. Injeta o container invisível do Modal vindo do components.html
    await carregarComponenteModal();
    
    // 3. Renderiza os cards puxando o template e injetando os dados do localStorage
    renderizarFichasSalvas();
});

// Busca o modal no arquivo central e o injeta na página atual
async function carregarComponenteModal() {
    try {
        const response = await fetch("../pages/components.html");
        if (!response.ok) throw new Error("Erro ao carregar repositório de componentes.");
        
        const htmlText = await response.text();
        const parser = new DOMParser();
        const docVirtual = parser.parseFromString(htmlText, "text/html");
        
        const modalTemplate = docVirtual.getElementById('comp-modal-ficha');
        if (modalTemplate) {
            document.body.appendChild(modalTemplate.cloneNode(true));
            console.log("Bastidores: Componente do Modal injetado com sucesso!");
        } else {
            console.warn("Aviso: O componente com id 'comp-modal-ficha' não existe no components.html.");
        }
    } catch (error) {
        console.error("Algo deu errado ao carregar o modal de componentes:", error);
    }
}

function renderizarFichasSalvas() {
    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) return;

    // Busca as fichas guardadas no localStorage
    const fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];

    // Se não houver fichas, exibe o aviso amigável
    if (fichas.length === 0) {
        cardsGrid.innerHTML = `
            <p style="color: #bbb; text-align: center; grid-column: 1 / -1; padding: 40px; font-family: sans-serif;">
                Nenhum personagem encontrado. Crie um personagem na aba "Criar Ficha"!
            </p>`;
        return;
    }

    cardsGrid.innerHTML = '';

    try {
        // 1. Carrega o components.html em segundo plano para extrair a estrutura pura
        fetch("../pages/components.html")
            .then(res => res.text())
            .then(htmlText => {
                const parser = new DOMParser();
                const docVirtual = parser.parseFromString(htmlText, "text/html");
                
                // Pega o card de exemplo que está salvo no repositório de componentes
                const templateOriginal = docVirtual.getElementById("card-minhas-fichas");

                if (!templateOriginal) {
                    console.error("Erro: Template 'card-minhas-fichas' não encontrado no components.html");
                    return;
                }

                // 2. Itera pelas fichas reais do localStorage clonando o template para cada uma
                fichas.forEach(personagem => {
                    const cardClone = templateOriginal.cloneNode(true);
                    const artigoCard = cardClone.querySelector('.char-card');

                    // 3. Substitui os dados fictícios do template pelos dados do banco do navegador
                    artigoCard.querySelector('h4').textContent = personagem.info.nome || "Sem Nome";
                    artigoCard.querySelector('.char-level').textContent = `Nvl ${personagem.info.nivel || 1}`;
                    artigoCard.querySelector('.hp-label').textContent = `VIDA: ${personagem.info.vidaMax || 0}`;
                    artigoCard.querySelector('figcaption').textContent = personagem.info.classe || "Guerreiro";

                    // Alinha os atributos numéricos com as colunas da tabela (VIT, FOR, DES, etc.)
                    const celulasAtributos = artigoCard.querySelectorAll('.stats-table tbody td');
                    if (celulasAtributos.length >= 7) {
                        celulasAtributos[0].textContent = personagem.atributos?.vitality?.base || 0;
                        celulasAtributos[1].textContent = personagem.atributos?.strength?.base || 0;
                        celulasAtributos[2].textContent = personagem.atributos?.dexterity?.base || 0;
                        celulasAtributos[3].textContent = personagem.atributos?.resistence?.base || 0;
                        celulasAtributos[4].textContent = personagem.atributos?.intelligence?.base || 0;
                        celulasAtributos[5].textContent = personagem.atributos?.faith?.base || 0;
                        celulasAtributos[6].textContent = personagem.atributos?.humanity || 0;
                    }

                    // Insere o item inicial/dádiva na lista rápida
                    const itemLista = artigoCard.querySelector('.equip-list li');
                    if (itemLista) {
                        itemLista.textContent = personagem.info.dadiva || 'Nenhum item';
                    }

                    // 4. Captura a lista de botões do rodapé e mapeia as ações do Modal de forma indexada
                    const botoes = artigoCard.querySelectorAll('.action-buttons button');
                    if (botoes.length >= 3) {
                        // Botão Visualizar: Abre no modo Readonly (false)
                        botoes[0].addEventListener('click', () => abrirModalVisualizacao(personagem, 'minhasFichas', false)); 
                        
                        // Botão Editar: Abre liberado direto para escrita (true)
                        botoes[1].addEventListener('click', () => abrirModalVisualizacao(personagem, 'minhasFichas', true)); 
                        
                        // Botão Deletar
                        botoes[2].addEventListener('click', () => deletarFicha(personagem.id));                        
                    }

                    // Envia o card montado e configurado para a tela
                    cardsGrid.appendChild(artigoCard);
                });
                
                // Atualiza o contador de fichas com o tamanho real da lista
                const contador = document.querySelector('.panel-header small');
                if (contador) {
                    contador.textContent = `MINHAS FICHAS (${fichas.length})`;
                }
            });

    } catch (erro) {
        console.error("Erro no processamento da renderização dos cartões:", erro);
    }
}

function deletarFicha(id) {
    if (confirm("Tem certeza que deseja deletar permanentemente este personagem?")) {
        let fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
        fichas = fichas.filter(p => p.id !== id);
        localStorage.setItem('fichasRPG', JSON.stringify(fichas));
        renderizarFichasSalvas();
    }
}

// Expõe as funções principais para o escopo global por segurança de renderização
window.renderizarFichasSalvas = renderizarFichasSalvas;
window.deletarFicha = deletarFicha;