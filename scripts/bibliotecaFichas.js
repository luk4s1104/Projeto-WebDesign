import loader from './components/loader.js';
import { abrirModalVisualizacao } from './components/modalController.js';
import { matchFilterRules } from './utils/filterController.js';

let idCronometroAlerta = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Carrega o header e footer globais dinamicamente
        if (typeof loader === 'function') {
            await loader;
        }

        // CORREÇÃO: Injeta o modal localmente para que o botão Visualizar funcione na biblioteca
        await injetarModalLocalmente("../pages/components.html");

        // 2. Mapeia os dados estáticos do HTML e ativa os botões de ação imediatamente
        configurarCliquesBiblioteca();

        // 3. Ativa os ouvintes dos inputs de filtro manualmente para garantir sincronia
        inicializarOuvintesFiltro();

    } catch (erro) {
        console.error("Erro nos bastidores ao inicializar a biblioteca:", erro);
    }
});

// NOVA FUNÇÃO: Injeta a estrutura do modal de forma assíncrona na página da biblioteca
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

// Varre as fichas estáticas da comunidade no HTML e injeta a inteligência de clique nelas
function configurarCliquesBiblioteca() {
    const cards = document.querySelectorAll('.char-card.card-v2');
    
    cards.forEach(card => {
        try {
            const nome = card.querySelector('.char-name-display')?.textContent.trim() || "Sem Nome";
            const autor = card.querySelector('.char-author')?.textContent.trim() || "@Anonimo";
            const nivelTexto = card.querySelector('.char-level-display')?.textContent.trim() || "Nvl 0";
            const nivel = nivelTexto.replace('Nvl ', '').trim();
            const classe = card.querySelector('.char-class-display')?.textContent.trim() || "Geral";
            const vidaTexto = card.querySelector('.hp-text-value')?.textContent.trim() || "VIDA: 0";
            const vidaMax = vidaTexto.replace('VIDA: ', '').trim();
            const imagemUrl = card.querySelector('.avatar-img-display')?.getAttribute('src') || "../Img_folder/generico.jpg";

            const vitality = card.querySelector('.attr-row-vit td:nth-child(2)')?.textContent.trim() || "0";
            const strength = card.querySelector('.attr-row-for td:nth-child(2)')?.textContent.trim() || "0";
            const dexterity = card.querySelector('.attr-row-des td:nth-child(2)')?.textContent.trim() || "0";
            const resistence = card.querySelector('.attr-row-res td:nth-child(2)')?.textContent.trim() || "0";
            const intelligence = card.querySelector('.attr-row-int td:nth-child(2)')?.textContent.trim() || "0";
            const faith = card.querySelector('.attr-row-fai td:nth-child(2)')?.textContent.trim() || "0";
            const humanity = card.querySelector('.attr-row-hum td:nth-child(2)')?.textContent.trim() || "0";

            const feiticos = card.querySelector('.block-spells-v2 p')?.textContent.trim() || '';
            const equipamento = card.querySelector('.block-equip-v2 p')?.textContent.trim() || '';
            const itensMochila = card.querySelector('.block-items-v2 p')?.textContent.trim() || '';

            const personagemObjeto = {
                id: 'publico',
                info: { nome, autor, classe, nivel, vidaMax, imagem: imagemUrl, dadiva: equipamento },
                atributos: {
                    vitality: { base: vitality, mod: "0", modLevel: "0" },
                    strength: { base: strength, mod: "0", modLevel: "0" },
                    dexterity: { base: dexterity, mod: "0", modLevel: "0" },
                    resistence: { base: resistence, mod: "0", modLevel: "0" },
                    intelligence: { base: intelligence, mod: "0", modLevel: "0" },
                    faith: { base: faith, mod: "0", modLevel: "0" },
                    humanity: humanity
                },
                detalhes: { feiticos, equipamento, itensMochila }
            };

            card.dataset.characterData = JSON.stringify(personagemObjeto);

            const btnVisualizar = card.querySelector('.btn-v2-view');
            if (btnVisualizar) {
                btnVisualizar.onclick = (e) => {
                    e.preventDefault();
                    abrirModalVisualizacao(personagemObjeto, 'biblioteca', false);
                };
            }

            const btnClonar = card.querySelector('.btn-v2-clone');
            if (btnClonar) {
                btnClonar.onclick = (e) => {
                    e.preventDefault();
                    clonarFichaParaPainel(personagemObjeto);
                };
            }
        } catch (errCard) {
            console.warn("Aviso: Falha ao mapear atributos de um card específico.", errCard);
        }
    });

    atualizarContadorBiblioteca(cards.length);
}

function inicializarOuvintesFiltro() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (inputPesquisar) inputPesquisar.addEventListener('input', aplicarFiltros);
    if (inputClasse) inputClasse.addEventListener('input', aplicarFiltros);
    if (inputNivel) inputNivel.addEventListener('input', aplicarFiltros);
}

function aplicarFiltros() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    const termoBusca = inputPesquisar ? inputPesquisar.value.toLowerCase().trim() : '';
    const termoClasse = inputClasse ? inputClasse.value.toLowerCase().trim() : '';
    const termoNivel = inputNivel ? inputNivel.value.trim() : '';

    const cards = document.querySelectorAll('.char-card.card-v2');
    let cardsVisiveis = 0;

    cards.forEach(card => {
        if (!card.dataset.characterData) return;
        const personagem = JSON.parse(card.dataset.characterData);
        const passaNoFiltro = matchFilterRules(personagem, termoBusca, termoClasse, termoNivel);

        if (passaNoFiltro) {
            card.style.display = "";
            cardsVisiveis++;
        } else {
            card.style.display = "none";
        }
    });

    atualizarContadorBiblioteca(cardsVisiveis);
}

function clonarFichaParaPainel(personagemObjeto) {
    try {
        let minhasFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
        const novaFicha = { 
            ...personagemObjeto, 
            id: Date.now(), 
            info: { ...personagemObjeto.info, autor: "@Voce" }
        }; 
        minhasFichas.push(novaFicha);
        localStorage.setItem('fichasRPG', JSON.stringify(minhasFichas));
        mostrarAlertaClonado(personagemObjeto.info.nome);
    } catch (erroClone) {
        console.error("Erro crítico ao salvar clonagem de personagem:", erroClone);
    }
}

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
        texto.textContent = `A ficha do(a) ${nomePersonagem} foi clonada com sucesso!`;
        alerta.classList.remove('closed');
        alerta.classList.add('open');
        
        if (idCronometroAlerta) clearTimeout(idCronometroAlerta);
        
        idCronometroAlerta = setTimeout(() => {
            fecharAlertaClonado();
        }, 3500);
    }
}

function fecharAlertaClonado() {
    const alerta = document.getElementById('personagemClonadoAlerta');
    if (alerta) {
        alerta.classList.remove('open');
        alerta.classList.add('closed');
    }
    if (idCronometroAlerta) {
        clearTimeout(idCronometroAlerta);
        idCronometroAlerta = null; 
    }
}

window.fecharAlertaClonado = fecharAlertaClonado;
window.mostrarAlertaClonado = mostrarAlertaClonado;