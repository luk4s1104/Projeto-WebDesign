import loader from './loader.js';
import { abrirModalVisualizacao } from './modalController.js';

// Executado assim que a página HTML estrutural é carregada no navegador
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega os componentes estáticos globais (header/footer)
    if (typeof loader === 'function') {
        await loader();
    }
    
    // 2. Injeta o container invisível do Modal vindo do components.html
    await carregarComponenteModal();
    
    // 3. Renderiza os cards puxando o template e injetando os dados do localStorage
    renderizarFichasSalvas();

    // 4. Ativa os ouvintes de evento para os campos do filtro de busca
    inicializarFiltros();
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

// Renderiza a lista de cartões na tela (aceita receber uma lista filtrada como argumento opcional)
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
        
        // Mantém o contador sincronizado com o tamanho da lista filtrada (0 neste caso)
        const contador = document.querySelector('.panel-header small');
        if (contador) {
            contador.textContent = `MINHAS FICHAS (${fichas.length})`;
        }
        return;
    }

    cardsGrid.innerHTML = '';

    try {
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

                    // Preenche sequencialmente a tabela horizontal de atributos base
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

                    // Adiciona a dádiva/item inicial na lista de exibição curta
                    const itemLista = artigoCard.querySelector('.equip-list li');
                    if (itemLista) {
                        itemLista.textContent = personagem.info?.dadiva || 'Nenhum item';
                    }

                    // Configura os ouvintes de ação para o menu de botões do rodapé do cartão
                    const botoes = artigoCard.querySelectorAll('.action-buttons button');
                    if (botoes && botoes.length >= 4) {
                        // Botão Visualizar (Índice 0)
                        botoes[0].addEventListener('click', () => abrirModalVisualizacao(personagem, 'minhasFichas', false)); 
                        
                        // Botão Editar (Índice 1)
                        botoes[1].addEventListener('click', () => abrirModalVisualizacao(personagem, 'minhasFichas', true)); 
                        
                        // Botão Deletar (Índice 2)
                        botoes[2].addEventListener('click', () => deletarFicha(personagem.id));                        
                        
                        // Botão Salvar (Índice 3): Envia o elemento HTML do card para marcar antes do PDF
                        botoes[3].addEventListener('click', () => salvarPDF(artigoCard));
                    }

                    // Empurra o cartão montado para dentro da grid visual do documento
                    cardsGrid.appendChild(artigoCard);
                });
                
                // Sincroniza o contador superior com o tamanho da lista que está sendo visualizada
                const contador = document.querySelector('.panel-header small');
                if (contador) {
                    contador.textContent = `MINHAS FICHAS (${fichas.length})`;
                }
            });

    } catch (erro) {
        console.error("Erro no processamento da renderização dos cartões:", erro);
    }
}

// Auxiliar simples caso seu código use mapeamento de nome de classe
function fantasyMapClasse(classe) {
    return classe;
}


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

function fecharPopupDeletar() {
    const popup = document.getElementById('popupDeletarFicha');
    if (popup) {
        popup.classList.remove('open');
        popup.classList.add('closed');
    }
}

// Vincula a função de fechar à janela global para os cliques do "X" e do "Cancelar" funcionarem
window.fecharPopupDeletar = fecharPopupDeletar;


// Gerencia o processamento da busca avançada utilizando .filter() nativo do JavaScript
function aplicarFiltros() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    // Aborta de forma segura caso os elementos ainda não existam no DOM
    if (!inputPesquisar || !inputClasse || !inputNivel) return;

    // Resgata o banco puro contendo todas as fichas brutas
    const todasAsFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];

    // Limpa espaços extras e padroniza para caixa baixa (case-insensitive)
    const termoBusca = inputPesquisar.value.toLowerCase().trim();
    const termoClasse = inputClasse.value.toLowerCase().trim();
    const termoNivel = inputNivel.value.trim();

    // Filtra o array baseado nas correspondências múltiplas simultâneas
    const fichasFiltradas = todasAsFichas.filter(personagem => {
        const nomeCard = (personagem.info?.nome || "").toLowerCase();
        const classeCard = (personagem.info?.classe || "").toLowerCase();
        const nivelCard = parseInt(personagem.info?.nivel, 10) || 0;

        const bateNome = termoBusca === '' || nomeCard.includes(termoBusca);
        const bateClasse = termoClasse === '' || classeCard.includes(termoClasse);
        const bateNivel = termoNivel === '' || nivelCard >= parseInt(termoNivel, 10);

        return bateNome && bateClasse && bateNivel;
    });

    // Atualiza a interface renderizando apenas o subconjunto resultante do filtro
    renderizarFichasSalvas(fichasFiltradas);
}

// Vincula os escutadores de digitação nos elementos de formulário
function inicializarFiltros() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (inputPesquisar) inputPesquisar.addEventListener('input', aplicarFiltros);
    if (inputClasse) inputClasse.addEventListener('input', aplicarFiltros);
    if (inputNivel) inputNivel.addEventListener('input', aplicarFiltros);
}

// Expõe os métodos estratégicos para o escopo global da janela de navegação
window.renderizarFichasSalvas = renderizarFichasSalvas;
window.deletarFicha = deletarFicha;
window.aplicarFiltros = aplicarFiltros;

function salvarPDF(cardElemento) {
    // 1. Clona o card completo de forma idêntica
    const cardClone = cardElemento.cloneNode(true);
    
    // 2. Adiciona a classe exclusiva de impressão mapeada no CSS
    cardClone.classList.add('char-card-print-target');
    
    // 3. Encontra a lista de botões dentro do clone e deleta ela fisicamente para não sair no PDF
    const botoesParaRemover = cardClone.querySelector('.action-buttons');
    if (botoesParaRemover) {
        botoesParaRemover.remove();
    }
    
    // 4. Injeta temporariamente o clone limpo direto no <body> da página (fora de contêineres ocultos)
    document.body.appendChild(cardClone);

    // 5. Dispara a janela nativa de impressão/salvamento em PDF do navegador
    window.print();

    // 6. Remove o clone logo após o fechamento da janela para não acumular lixo na interface
    cardClone.remove();
}

