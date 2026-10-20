import loader from './components/loader.js';
import { abrirModalVisualizacao } from './components/modalController.js';
import { matchFilterRules } from './utils/filterController.js';

// Executado assim que a página HTML estrutural é carregada no navegador
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Carrega os componentes estáticos globais (header/footer)
        if (typeof loader === 'function') {
            await loader();
        }

        // 2. Injeta o modal de forma assíncrona local para evitar erros de importação
        await injetarModalLocalmente("../pages/components.html");

        // 3. Renderiza os cards puxando o template e injetando os dados do localStorage
        renderizarFichasSalvas();

        // 4. Ativa os ouvintes de evento para os campos do filtro de busca
        inicializarOuvintesFiltro();
    } catch (error) {
        console.error("Erro ao inicializar o painel de minhas fichas:", error);
    }
});

// Injeta a estrutura do modal diretamente na página atual sem depender do filterController
async function injetarModalLocalmente(urlComponentes) {
    try {
        const response = await fetch(urlComponentes);
        if (!response.ok) return;
        const htmlText = await response.text();
        const parser = new DOMParser();
        const docVirtual = parser.parseFromString(htmlText, "text/html");
        const originModal = docVirtual.getElementById("comp-modal-ficha");
        
        if (originModal) {
            const containerModal = document.createElement('div');
            containerModal.innerHTML = originModal.innerHTML;
            document.body.appendChild(containerModal);
        }
    } catch (err) {
        console.warn("Aviso: Falha ao carregar o modal de fichas de forma assíncrona:", err);
    }
}

// Vincula o evento 'input' diretamente aos campos para filtrar enquanto o usuário digita
function inicializarOuvintesFiltro() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (inputPesquisar) inputPesquisar.addEventListener('input', aplicarFiltros);
    if (inputClasse) inputClasse.addEventListener('input', aplicarFiltros);
    if (inputNivel) inputNivel.addEventListener('input', aplicarFiltros);
}

// Renderiza a lista de cartões na tela
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

                // Alimenta as tags textuais com as propriedades dinâmicas extraídas do banco (Classes V2 Alinhadas)
                artigoCard.querySelector('h4').textContent = personagem.info?.nome || "Sem Nome";
                artigoCard.querySelector('.char-level-display').textContent = `Nvl ${personagem.info?.nivel || 0}`;
                artigoCard.querySelector('.hp-text-value').textContent = `VIDA: ${personagem.info?.vidaMax || 0}`;
                artigoCard.querySelector('figcaption').textContent = personagem.info?.classe || "Geral";
                artigoCard.querySelector('.char-avatar img').src = personagem.info?.imagem || "../Img_folder/generico.jpg";

                // Preenche sequencialmente a tabela de atributos base (.grid-attributes-v2)
                preencherAtributosCard(artigoCard, personagem);

                // Injeta as informações curtas nas caixas visuais de texto rápido do Card V2
                const contentSpells = artigoCard.querySelector('.content-spells-v2');
                if (contentSpells) contentSpells.textContent = personagem.detalhes?.feiticos || "Nenhum feitiço aprendido.";

                const contentEquip = artigoCard.querySelector('.content-equip-v2');
                if (contentEquip) contentEquip.textContent = personagem.detalhes?.equipment || personagem.detalhes?.equipamento || "Nenhum item equipado.";

                const contentItems = artigoCard.querySelector('.content-items-v2');
                if (contentItems) contentItems.textContent = personagem.detalhes?.itensMochila || "Mochila vazia.";

                // Configura os ouvintes de ação para o menu de botões do rodapé do cartão V2
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
    const celulasAtributos = artigoCard.querySelectorAll('.grid-attributes-v2 tbody td.val-base');
    if (celulasAtributos.length >= 6) {
        celulasAtributos[0].textContent = personagem.atributos?.vitality?.base || 0;
        celulasAtributos[1].textContent = personagem.atributos?.strength?.base || 0;
        celulasAtributos[2].textContent = personagem.atributos?.dexterity?.base || 0;
        celulasAtributos[3].textContent = personagem.atributos?.resistence?.base || 0;
        celulasAtributos[4].textContent = personagem.atributos?.intelligence?.base || 0;
        celulasAtributos[5].textContent = personagem.atributos?.faith?.base || 0;
    }
    
    // Alinha o campo de humanidade que fica isolado no rodapé da tabela
    const celulaHumanidade = artigoCard.querySelector('.attr-row-hum .val-base');
    if (celulaHumanidade) {
        celulaHumanidade.textContent = personagem.atributos?.humanity || 0;
    }
}

// Vincula eventos aos botões de ação do personagem V2
function vincularBotoesCard(artigoCard, personagem) {
    const botoes = artigoCard.querySelectorAll('.action-buttons-v2 button');
    if (botoes && botoes.length >= 4) {
        botoes[0].onclick = (e) => { e.preventDefault(); abrirModalVisualizacao(personagem, 'minhasFichas', false); };
        botoes[1].onclick = (e) => { e.preventDefault(); abrirModalVisualizacao(personagem, 'minhasFichas', true); };
        botoes[2].onclick = (e) => { e.preventDefault(); deletarFicha(personagem.id); };                        
        botoes[3].onclick = (e) => { e.preventDefault(); salvarPDF(artigoCard); };
    }
}

// Atualiza o contador de cabeçalho com segurança
function atualizarContadorFichas(quantidade) {
    const contador = document.querySelector('.panel-header small');
    if (contador) {
        contador.textContent = `MINHAS FICHAS (${quantidade})`;
    }
}

// Remove o registro do localStorage e atualiza os filtros
function deletarFicha(id) {
    const popup = document.getElementById('popupDeletarFicha');
    const btnConfirmar = document.getElementById('btnConfirmarDeletar');
    
    if (popup && btnConfirmar) {
        popup.classList.remove('closed');
        popup.classList.add('open');
        
        btnConfirmar.onclick = () => {
            let fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
            fichas = fichas.filter(p => p.id !== id);
            localStorage.setItem('fichasRPG', JSON.stringify(fichas));
            
            fecharPopupDeletar();
            aplicarFiltros();
        };
    }
}

function fecharPopupDeletar() {
    const popup = document.getElementById('popupDeletarFicha');
    if (popup) {
        popup.classList.remove('open');
        popup.classList.add('closed');
    }
}

// Gerencia o processamento da busca avançada
function aplicarFiltros() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (!inputPesquisar || !inputClasse || !inputNivel) return;

    const todasAsFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];

    const termoBusca = inputPesquisar.value.toLowerCase().trim();
    const termoClasse = inputClasse.value.toLowerCase().trim();
    const termoNivel = inputNivel.value.trim();

    const fichasFiltradas = todasAsFichas.filter(personagem => 
        matchFilterRules(personagem, termoBusca, termoClasse, termoNivel)
    );

    renderizarFichasSalvas(fichasFiltradas);
}

// Imprime a ficha ocultando elementos de interface
function salvarPDF(cardElemento) {
    const cardClone = cardElemento.cloneNode(true);
    cardClone.classList.add('char-card-print-target');
    
    const botoesParaRemover = cardClone.querySelector('.action-buttons-v2');
    if (botoesParaRemover) {
        botoesParaRemover.remove();
    }
    
    document.body.appendChild(cardClone);
    window.print();
    cardClone.remove();
}

window.fecharPopupDeletar = fecharPopupDeletar;
window.renderizarFichasSalvas = renderizarFichasSalvas;
window.deletarFicha = deletarFicha;
window.aplicarFiltros = aplicarFiltros;