import loader from './loader.js';
import { abrirModalVisualizacao } from './modalController.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega o header e footer globais
    if (typeof loader === 'function') {
        await loader();
    }

    // 2. Injeta a estrutura física invisível do modal na página corrente
    await carregarComponenteModal();

    // 3. Vincula a inteligência de clique nas fichas estáticas da comunidade
    configurarCliquesBiblioteca();
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
        // Extrai os dados contidos nas tags HTML do card estático da comunidade
        const nome = card.querySelector('h4').textContent;
        const autor = card.querySelector('.char-subtitle').textContent;
        const nivelTexto = card.querySelector('.char-level').textContent;
        const nivel = nivelTexto.replace('Nvl ', '').trim();
        const classe = card.querySelector('figcaption').textContent;
        const vidaTexto = card.querySelector('.hp-label').textContent;
        const vidaMax = vidaTexto.replace('VIDA: ', '').trim();
        
        const celulas = card.querySelectorAll('.stats-table tbody td');
        const itemLista = card.querySelector('.equip-list li')?.textContent || '';

        // Monta o objeto estruturado simulando o banco de dados
        const personagemObjeto = {
            id: 'publico',
            info: { nome, classe, nivel, vidaMax, dadiva: itemLista },
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

        // Vincula a ação de clique nos botões do card específico
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
                alert(`A ficha de ${nome} foi clonada com sucesso!`);
            };
        }
    });
}