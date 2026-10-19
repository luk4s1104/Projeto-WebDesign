import loader from './components/loader.js';
import { abrirModalVisualizacao } from './components/modalController.js';
import { carregarComponenteModal, bindFilterInputs, matchFilterRules } from './utils/filterController.js';

// Executado assim que a página HTML estrutural é carregada no navegador
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega os componentes estáticos globais (header/footer)
    if (typeof loader === 'function') {
        await loader();
    }

    // 2. Injeta o container invisível do Modal vindo do components.html que espera o user clicar naquele botão
    await carregarComponenteModal("../pages/components.html");

    // 3. Renderiza os cards puxando o template e injetando os dados do localStorage
    renderizarFichasSalvas();

    // 4. Ativa os ouvintes de evento para os campos do filtro de busca
    bindFilterInputs(aplicarFiltros);
});

// Renderiza a lista de cartões na tela (aceita receber uma lista filtrada como argumento opcional)
// essa fichasFiltradas vem depois dos filtros passarem por localStorage e criarem a variavel, entao na primeira vez sempre roda sem nada como mostra acima depois se existem filtros ele coloca isso na função.
function renderizarFichasSalvas(fichasFiltradas = null) {
    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) return;

    // Se receber uma lista filtrada, usa ela. Caso contrário, puxa o banco de dados original completo
    const fichas = fichasFiltradas !== null ? fichasFiltradas : (JSON.parse(localStorage.getItem('fichasRPG')) || []);

    // Se não houver nenhuma ficha para exibir nesta lista atual
    if (fichas.length === 0) {
        cardsGrid.innerHTML = `
            <p style="color: #bbb; text-align: center; grid-column: 1 / -1; padding: 40px; font-family: sans-serif;">
                Nenhum personagem encontrado. Crie um personagem na aba "Criar Ficha"!
            </p>`;
        
        //usa essa função para renderizar a parte MINHAS FICHAS (X) onde x é o valor do argumento.
        atualizarContadorFichas(0);
        return;
    }

    cardsGrid.innerHTML = '';

    // Carrega o arquivo central de componentes para extrair a estrutura base limpa do cartão
    fetch("../pages/components.html")
        .then(res => res.text())
        .then(htmlText => {
            const parser = new DOMParser();
            const docVirtual = parser.parseFromString(htmlText, "text/html");
            const templateOriginal = docVirtual.getElementById("card-minhas-fichas");

            if (!templateOriginal) {
                console.error("Erro: Template 'card-minhas-fichas' não encontrado no components.html");
                return;
            }

            // Percorre a lista de fichas selecionadas clonando o template puro para cada uma delas
            fichas.forEach(personagem => {
                const cardClone = templateOriginal.cloneNode(true);
                const artigoCard = cardClone.querySelector('.char-card');

                    // Alimenta as tags textuais com as propriedades dinâmicas extraídas do banco
                    artigoCard.querySelector('h4').textContent = personagem.info?.nome || "Sem Nome";
                    artigoCard.querySelector('.char-level').textContent = `Nvl ${personagem.info?.nivel || 0}`;
                    artigoCard.querySelector('.hp-label').textContent = `VIDA: ${personagem.info?.vidaMax || 0}`;
                    artigoCard.querySelector('figcaption').textContent = personagem.info?.classe;
                    artigoCard.querySelector('.char-avatar img').src = personagem.info?.imagem || "../Img_folder/generico.jpg";

                // Preenche sequencialmente a tabela de atributos base
                preencherAtributosCard(artigoCard, personagem);

                // Adiciona a dádiva/item inicial na lista de exibição curta
                const itemLista = artigoCard.querySelector('.equip-list li');
                if (itemLista) {
                    itemLista.textContent = personagem.info?.dadiva || 'Nenhum item';
                }

                // Configura os ouvintes de ação para o menu de botões do rodapé do cartão
                vincularBotoesCard(artigoCard, personagem);

                // Empurra o cartão montado para dentro da grid visual do documento
                cardsGrid.appendChild(artigoCard);
            });
            
            atualizarContadorFichas(fichas.length);
        })
        .catch(erro => console.error("Erro no processamento da renderização dos cartões:", erro));
}

// Preenche sequencialmente os atributos na tabela visual do cartão
function preencherAtributosCard(artigoCard, personagem) {
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
}

// Vincula eventos aos botões de ação do personagem
function vincularBotoesCard(artigoCard, personagem) {
    const botoes = artigoCard.querySelectorAll('.action-buttons button');
    if (botoes && botoes.length >= 4) {
        botoes[0].addEventListener('click', () => abrirModalVisualizacao(personagem, 'minhasFichas', false)); 
        botoes[1].addEventListener('click', () => abrirModalVisualizacao(personagem, 'minhasFichas', true)); 
        botoes[2].addEventListener('click', () => deletarFicha(personagem.id));                        
        botoes[3].addEventListener('click', () => salvarPDF(artigoCard));
    }
}

// Atualiza de forma segura o texto do contador no cabeçalho
function atualizarContadorFichas(quantidade) {
    const contador = document.querySelector('.panel-header small');
    if (contador) {
        contador.textContent = `MINHAS FICHAS (${quantidade})`;
    }
}


// Remove o registro do localStorage e atualiza os filtros de pesquisa ativos
function deletarFicha(id) {
    const popup = document.getElementById('popupDeletarFicha');
    const btnConfirmar = document.getElementById('btnConfirmarDeletar');
    
    if (popup && btnConfirmar) {
        // Abre visualmente o pop-up de confirmação na tela
        popup.classList.remove('closed');
        popup.classList.add('open');
        
        // Configura o que acontece quando clica no botão "Sim, Deletar"
        btnConfirmar.onclick = () => {
            // Remove o registro do banco de dados
            let fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
            fichas = fichas.filter(p => p.id !== id);
            localStorage.setItem('fichasRPG', JSON.stringify(fichas));
            
            // Fecha o pop-up e recarrega a lista filtrada na tela
            fecharPopupDeletar();
            aplicarFiltros();
        };
    }
}

// Vincula a função de fechar à janela global para os cliques do "X" e do "Cancelar" funcionarem
function fecharPopupDeletar() {
    const popup = document.getElementById('popupDeletarFicha');
    if (popup) {
        popup.classList.remove('open');
        popup.classList.add('closed');
    }
}

// Gerencia o processamento da busca avançada utilizando .filter() nativo do JavaScript
function aplicarFiltros() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (!inputPesquisar || !inputClasse || !inputNivel) return;

    const todasAsFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];

    const termoBusca = inputPesquisar.value.toLowerCase().trim();
    const termoClasse = inputClasse.value.toLowerCase().trim();
    const termoNivel = inputNivel.value.trim();

    // Filtra o array usando as regras universais importadas do filterController
    const fichasFiltradas = todasAsFichas.filter(personagem => 
        matchFilterRules(personagem, termoBusca, termoClasse, termoNivel)
    );

    renderizarFichasSalvas(fichasFiltradas);
}

// Imprime a ficha ocultando elementos de interface
function salvarPDF(cardElemento) {
    const cardClone = cardElemento.cloneNode(true);
    cardClone.classList.add('char-card-print-target');
    
    const botoesParaRemover = cardClone.querySelector('.action-buttons');
    if (botoesParaRemover) {
        botoesParaRemover.remove();
    }
    
    document.body.appendChild(cardClone);
    window.print();
    cardClone.remove();
}

// Expõe os métodos estratégicos para o escopo global se necessário
window.fecharPopupDeletar = fecharPopupDeletar;
window.renderizarFichasSalvas = renderizarFichasSalvas;
window.deletarFicha = deletarFicha;
window.aplicarFiltros = aplicarFiltros;