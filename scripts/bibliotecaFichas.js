import loader from './components/loader.js';
import { abrirModalVisualizacao } from './components/modalController.js';
import { matchFilterRules } from './utils/filterController.js';

let idCronometroAlerta = null;

// Inicialização segura controlada por eventos do ciclo de vida da página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Carrega o header e footer globais dinamicamente
        if (typeof loader === 'function') {
            await loader;
        }

        // 2. Mapeia os dados estáticos do HTML e ativa os botões de ação imediatamente
        configurarCliquesBiblioteca();

        // 3. Ativa os ouvintes dos inputs de filtro manualmente para garantir sincronia
        inicializarOuvintesFiltro();

    } catch (erro) {
        console.error("Erro nos bastidores ao inicializar a biblioteca:", erro);
    }
});

// Varre as fichas estáticas da comunidade no HTML e injeta a inteligência de clique nelas
function configurarCliquesBiblioteca() {
    const cards = document.querySelectorAll('.char-card.card-v2');
    
    cards.forEach(card => {
        try {
            // Coleta básica biográfica estruturada V2
            const nome = card.querySelector('.char-name-display')?.textContent.trim() || "Sem Nome";
            const autor = card.querySelector('.char-author')?.textContent.trim() || "@Anonimo";
            const nivelTexto = card.querySelector('.char-level-display')?.textContent.trim() || "Nvl 0";
            const nivel = nivelTexto.replace('Nvl ', '').trim();
            const classe = card.querySelector('.char-class-display')?.textContent.trim() || "Geral";
            const vidaTexto = card.querySelector('.hp-text-value')?.textContent.trim() || "VIDA: 0";
            const vidaMax = vidaTexto.replace('VIDA: ', '').trim();
            const imagemUrl = card.querySelector('.avatar-img-display')?.getAttribute('src') || "../Img_folder/generico.jpg";

            // Varre a tabela de atributos .grid-attributes-v2 de forma segura
            const vitality = card.querySelector('.attr-row-vit td:nth-child(2)')?.textContent.trim() || "0";
            const strength = card.querySelector('.attr-row-for td:nth-child(2)')?.textContent.trim() || "0";
            const dexterity = card.querySelector('.attr-row-des td:nth-child(2)')?.textContent.trim() || "0";
            const resistence = card.querySelector('.attr-row-res td:nth-child(2)')?.textContent.trim() || "0";
            const intelligence = card.querySelector('.attr-row-int td:nth-child(2)')?.textContent.trim() || "0";
            const faith = card.querySelector('.attr-row-fai td:nth-child(2)')?.textContent.trim() || "0";
            const humanity = card.querySelector('.attr-row-hum td:nth-child(2)')?.textContent.trim() || "0";

            // Varre os blocos textuais longos com scroll
            const feiticos = card.querySelector('.block-spells-v2 p')?.textContent.trim() || '';
            const equipamento = card.querySelector('.block-equip-v2 p')?.textContent.trim() || '';
            const itensMochila = card.querySelector('.block-items-v2 p')?.textContent.trim() || '';

            // Monta o objeto padronizado do ecossistema garantindo compatibilidade com o modalController
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

            // Guarda os dados tratados como metadados no próprio elemento HTML
            card.dataset.characterData = JSON.stringify(personagemObjeto);

            // Vincula os cliques nos botões do rodapé V2 de forma segura
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

    // Atualiza o contador de cabeçalho com o total inicial de cards encontrados no HTML
    atualizarContadorBiblioteca(cards.length);
}

// Vincula o evento 'input' diretamente aos campos para filtrar enquanto o usuário digita
// Vincula o evento 'input' diretamente aos campos para filtrar enquanto o usuário digita
function inicializarOuvintesFiltro() {
    const inputPesquisar = document.getElementById('pesquisar');
    const inputClasse = document.getElementById('classe');
    const inputNivel = document.getElementById('nivel');

    if (inputPesquisar) inputPesquisar.addEventListener('input', aplicarFiltros);
    if (inputClasse) inputClasse.addEventListener('input', aplicarFiltros);
    if (inputNivel) inputNivel.addEventListener('input', aplicarFiltros);
}

// Lógica de processamento e filtragem visual dos cards
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

        // Valida as regras através do motor do filterController.js
        const passaNoFiltro = matchFilterRules(personagem, termoBusca, termoClasse, termoNivel);

        if (passaNoFiltro) {
            card.style.display = ""; // Exibe o elemento respeitando o layout CSS original (grid)
            cardsVisiveis++;
        } else {
            card.style.display = "none"; // Oculta o card completamente
        }
    });

    atualizarContadorBiblioteca(cardsVisiveis);
}

// Salva de forma persistente a cópia tratada da ficha no LocalStorage privado
function clonarFichaParaPainel(personagemObjeto) {
    try {
        let minhasFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
        const novaFicha = { 
            ...personagemObjeto, 
            id: Date.now(), // Substitui o ID temporário por um timestamp real exclusivo
            info: { ...personagemObjeto.info, autor: "@Voce" } // Atualiza a assinatura de posse
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

// Vincula métodos ao escopo global do navegador para segurança de chamadas em linha inline
window.fecharAlertaClonado = fecharAlertaClonado;
window.mostrarAlertaClonado = mostrarAlertaClonado;