document.addEventListener('DOMContentLoaded', async () => {
    // 1. Aguarda os componentes globais carregarem (como o header/footer)
    // Se o seu loader não retorna uma Promise, certifique-se de tratar a sincronia.
    // Para renderizar os dados do localStorage nos cards, faremos a busca direta:
    renderizarFichasSalvas();
});

async function renderizarFichasSalvas() {
    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) return;

    const fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];

    if (fichas.length === 0) {
        cardsGrid.innerHTML = `
            <p style="color: #bbb; text-align: center; grid-column: 1 / -1; padding: 40px; font-family: sans-serif;">
                Nenhum personagem encontrado. Crie um personagem na aba "Criar Ficha"!
            </p>`;
        return;
    }

    cardsGrid.innerHTML = '';

    try {
        // 2. Pegamos o arquivo contendo os componentes para extrair o template limpo
        const response = await fetch("../pages/components.html");
        if (!response.ok) throw new Error("Erro ao carregar repositório de componentes.");
        
        const htmlText = await response.text();
        const parser = new DOMParser();
        const docVirtual = parser.parseFromString(htmlText, "text/html");
        
        // CORREÇÃO: O ID no seu components.html é "card-minhas-fichas" (com 's' e no plural)
        const templateComponent = docVirtual.getElementById("card-minhas-fichas");

        if (!templateComponent) {
            console.error("Componente 'card-minhas-fichas' não foi encontrado no arquivo de origem.");
            return;
        }

        // 3. Iteramos por cada ficha salva no localStorage atribuindo as variáveis ao HTML
        fichas.forEach(personagem => {
            // Cria uma cópia isolada do HTML do template do card
            const clone = templateComponent.cloneNode(true);

            // 4. Mapeamento e Atribuição das variáveis nos locais corretos do componente:
            clone.querySelector('h4').textContent = personagem.info.nome || "Sem Nome";
            clone.querySelector('.char-subtitle').textContent = `Por: @Você`; // Ou mapear criador se houver
            clone.querySelector('.char-level').textContent = `Nvl ${personagem.info.nivel || 1}`;
            clone.querySelector('.hp-label').textContent = `VIDA: ${personagem.info.vidaMax || 0}`;
            clone.querySelector('figcaption').textContent = personagem.info.classe || "Generico";

            // Atualizando a tabela de atributos (colunas da tabela: VIT, FOR, DES, RES, INT, FÉ, HUM)
            const celulasStats = clone.querySelectorAll('.stats-table tbody td');
            if (celulasStats.length >= 7) {
                celulasStats[0].textContent = personagem.atributos.vitality.base;
                celulasStats[1].textContent = personagem.atributos.strength.base;
                celulasStats[2].textContent = personagem.atributos.dexterity.base;
                celulasStats[3].textContent = personagem.atributos.resistence.base;
                celulasStats[4].textContent = personagem.atributos.intelligence.base;
                celulasStats[5].textContent = personagem.atributos.faith.base;
                celulasStats[6].textContent = personagem.atributos.humanity;
            }

            // Atualizando a lista visual rápida de equipamentos/itens na mochila
            const listaEquip = clone.querySelector('.equip-list');
            if (listaEquip) {
                listaEquip.innerHTML = `
                    <li>${personagem.info.dadiva || 'Nenhum'}</li>
                `;
            }

            // Vincula dinamicamente a função de deletar ao botão correspondente do card clonado
            const botoesAcao = clone.querySelectorAll('.action-buttons button');
            botoesAcao.forEach(botao => {
                if (botao.textContent.toLowerCase() === 'deletar') {
                    botao.addEventListener('click', () => deletarFicha(personagem.id));
                }
            });

            // Insere o card montado com os dados reais na tela
            cardsGrid.appendChild(clone.firstElementChild);
        });

    } catch (erro) {
        console.error("Erro ao processar template dos cards:", erro);
    }

    // 5. Atualiza o pequeno contador dinâmico do cabeçalho da página
    const contador = document.querySelector('.panel-header small');
    if (contador) {
        contador.textContent = `MINHAS FICHAS (${fichas.length})`;
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

window.renderizarFichasSalvas = renderizarFichasSalvas;
window.deletarFicha = deletarFicha;