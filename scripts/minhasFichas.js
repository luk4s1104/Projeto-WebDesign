document.addEventListener('DOMContentLoaded', () => {
    renderizarFichasSalvas();
});

function renderizarFichasSalvas() {
    // 1. Seleciona a div grid onde os cards devem ser inseridos
    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) return;

    // 2. Busca as fichas guardadas no localStorage
    const fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];

    // Se não houver fichas salvas, limpa a tela e avisa o jogador
    if (fichas.length === 0) {
        cardsGrid.innerHTML = `
            <p style="color: #bbb; text-align: center; grid-column: 1 / -1; padding: 40px; font-family: sans-serif;">
                Nenhum personagem encontrado. Crie um personagem na aba "Criar Ficha"!
            </p>`;
        return;
    }

    // 3. Limpa o card estático de exemplo para injetar os dados reais
    cardsGrid.innerHTML = '';

    // 4. Percorre a lista de fichas criando a estrutura visual idêntica à sua
        // 4. Percorre a lista de fichas criando a estrutura visual idêntica à sua
    fichas.forEach(p => {
        const card = document.createElement('article');
        card.className = 'char-card';

        card.innerHTML = `
            <header class="char-card-header">
                <div>
                    <h4>${p.info.nome}</h4>
                    <div class="char-subtitle">Por: @LucasRicci</div>
                </div>
                <span class="char-level">Nvl ${p.info.nivel}</span>
            </header>

            <figure class="char-avatar">
                <img src="../Img_folder/generico.jpg" alt="Avatar do personagem">
                <figcaption>${p.info.classe}</figcaption>
            </figure>

            <!-- Bloco de Vida adicionado e alinhado -->
            <div class="char-hp">
                <span class="hp-label">VIDA: ${p.info.vidaMax || '0'}</span>
            </div>

            <!-- Tabela atualizada com a coluna HUM -->
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>VIT</th><th>FOR</th><th>DES</th><th>RES</th><th>INT</th><th>FÉ</th><th>HUM</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${p.atributos.vitality.base}</td>
                        <td>${p.atributos.strength.base}</td>
                        <td>${p.atributos.dexterity.base}</td>
                        <td>${p.atributos.resistence.base}</td>
                        <td>${p.atributos.intelligence.base}</td>
                        <td>${p.atributos.faith.base}</td>
                        <td>${p.atributos.humanity || '0'}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Lista de equipamentos limpa e puxando as variáveis corretas -->
            <ul class="equip-list">
                <li>${p.info.armaPrincipal || 'Martelo de Guerra'}</li>
                <li>${p.info.armaSecundaria || 'Escudo Pesado'}</li>
            </ul>

            <!-- Rodapé do card aberto e fechado corretamente -->
            <footer class="char-card-footer">
                <ul class="action-buttons">
                    <li><button type="button">Visualizar</button></li>
                    <li><button type="button">Editar</button></li>
                    <li><button type="button" onclick="deletarFicha(${p.id})">Deletar</button></li>
                    <li><button type="button">Compartilhar</button></li>
                </ul>
            </footer>
        `;

        cardsGrid.appendChild(card);
    });

    // 5. Atualiza o pequeno contador dinâmico do cabeçalho da página
    const contador = document.querySelector('.panel-header small');
    if (contador) {
        contador.textContent = `MINHAS FICHAS (${fichas.length})`;
    }
}

// Função para deletar um personagem específico pelo ID único
function deletarFicha(id) {
    if (confirm("Tem certeza que deseja deletar permanentemente este personagem?")) {
        let fichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
        // Mantém na lista apenas as fichas que possuem ID diferente do clicado
        fichas = fichas.filter(p => p.id !== id);
        // Devolve os dados remanescentes para a memória do navegador
        localStorage.setItem('fichasRPG', JSON.stringify(fichas));
        // Recarrega os cards na tela instantaneamente
        renderizarFichasSalvas();
    }
}

// EXPÕE AS FUNÇÕES PARA O ESCOPO GLOBAL: Garante funcionamento dos cliques
window.renderizarFichasSalvas = renderizarFichasSalvas;
window.deletarFicha = deletarFicha;
