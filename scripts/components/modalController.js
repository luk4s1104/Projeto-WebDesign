// Exibe o modal injetando as propriedades do personagem
export function abrirModalVisualizacao(personagem, deQuem, modoEdicaoInicial = false) {
    const modal = document.getElementById('modalFicha');
    if (!modal) return;

    // Remove a classe hidden para exibir o modal na tela
    modal.classList.remove('hidden');

    // Preenche dados identificadores fundamentais
    document.getElementById('modalCharId').value = personagem.id;
    document.getElementById('modalTitle').textContent = modoEdicaoInicial ? `Editando: ${personagem.info.nome}` : `Ficha: ${personagem.info.nome}`;

    // Mapeia inputs de informações biográficas
    document.getElementById('modalName').value = personagem.info.nome || '';
    document.getElementById('modalLevel').value = personagem.info.nivel || 1;
    document.getElementById('modalClass').value = personagem.info.classe || '';
    document.getElementById('modalHealth').value = personagem.info.vidaMax || 0;
    document.getElementById('modalGift').value = personagem.info.dadiva || '';

    // Mapeia os atributos numéricos primários
    document.getElementById('modalVit').value = personagem.atributos?.vitality?.base || 0;
    document.getElementById('modalFor').value = personagem.atributos?.strength?.base || 0;
    document.getElementById('modalDes').value = personagem.atributos?.dexterity?.base || 0;
    document.getElementById('modalRes').value = personagem.atributos?.resistence?.base || 0;
    document.getElementById('modalInt').value = personagem.atributos?.intelligence?.base || 0;
    document.getElementById('modalFaith').value = personagem.atributos?.faith?.base || 0;
    document.getElementById('modalHum').value = personagem.atributos?.humanity || 0;

    // Define se o modal abre trancado ou liberado para escrita direta
    alternarModoEdicao(modoEdicaoInicial);

    // Renderiza os botões dinâmicos do rodapé
    configurarBotoesRodape(personagem, deQuem, modoEdicaoInicial);
    
    // Configura evento padrão de fechar no 'X' superior
    document.getElementById('closeModalBtn').onclick = fecharModalFicha;
}

function fecharModalFicha() {
    const modal = document.getElementById('modalFicha');
    if (modal) modal.classList.add('hidden');
    alternarModoEdicao(false); 
}

// Controla se os inputs são editáveis ou bloqueados (readonly)
function alternarModoEdicao(podeEditar) {
    const inputs = document.querySelectorAll('#modalForm input:not([type="hidden"])');
    inputs.forEach(input => {
        if (podeEditar) {
            input.removeAttribute('readonly');
            input.style.backgroundColor = '#1b242f';
            input.style.borderColor = '#1c6ba0';
        } else {
            input.setAttribute('readonly', 'true');
            input.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
            input.style.borderColor = 'rgba(39, 53, 68, 0.4)';
        }
    });
}

function configurarBotoesRodape(personagem, deQuem, estaEditando) {
    const footer = document.getElementById('modalFooterActions');
    footer.innerHTML = ''; // Reseta rodapé anterior

    // Botão universal de fechar embaixo
    const btnFechar = document.createElement('button');
    btnFechar.className = 'btn btn-secondary';
    btnFechar.textContent = 'Fechar';
    btnFechar.onclick = fecharModalFicha;
    footer.appendChild(btnFechar);

    if (deQuem === 'minhasFichas') {
        const btnAcao = document.createElement('button');
        btnAcao.className = 'btn btn-primary';
        
        if (estaEditando) {
            btnAcao.textContent = 'Salvar Alterações';
            btnAcao.style.backgroundColor = '#1a5c38'; // Verde sucesso
            btnAcao.onclick = () => {
                salvarAlteracoesFicha(personagem.id);
                fecharModalFicha();
                if (window.renderizarFichasSalvas) window.renderizarFichasSalvas();
            };
        } else {
            btnAcao.textContent = 'Habilitar Edição';
            btnAcao.onclick = () => {
                // Alterna dinamicamente para o modo de edição direta na tela
                abrirModalVisualizacao(personagem, 'minhasFichas', true);
            };
        }
        footer.appendChild(btnAcao);

    } else if (deQuem === 'biblioteca') {
        // Se veio da biblioteca pÚblica da comunidade
        const btnClonar = document.createElement('button');
        btnClonar.className = 'btn btn-primary';
        btnClonar.style.backgroundColor = '#1a5c38';
        btnClonar.textContent = 'Clonar para Meu Painel';
        btnClonar.onclick = () => {
            clonarFichaComunidade(personagem);
            fecharModalFicha();
        };
        footer.appendChild(btnClonar);
    }
}

function salvarAlteracoesFicha(id) {
    let bancoFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    const index = bancoFichas.findIndex(p => p.id === id);

    if (index !== -1) {
        bancoFichas[index].info.nome = document.getElementById('modalName').value;
        bancoFichas[index].info.nivel = document.getElementById('modalLevel').value;
        bancoFichas[index].info.classe = document.getElementById('modalClass').value;
        bancoFichas[index].info.vidaMax = document.getElementById('modalHealth').value;
        bancoFichas[index].info.dadiva = document.getElementById('modalGift').value;

        bancoFichas[index].atributos.vitality.base = document.getElementById('modalVit').value;
        bancoFichas[index].atributos.strength.base = document.getElementById('modalFor').value;
        bancoFichas[index].atributos.dexterity.base = document.getElementById('modalDes').value;
        bancoFichas[index].atributos.resistence.base = document.getElementById('modalRes').value;
        bancoFichas[index].atributos.intelligence.base = document.getElementById('modalInt').value;
        bancoFichas[index].atributos.faith.base = document.getElementById('modalFaith').value;
        bancoFichas[index].atributos.humanity = document.getElementById('modalHum').value;

        localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));
    }
}

function clonarFichaComunidade(personagem) {
    let minhasFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    const novaFicha = {
        ...personagem,
        id: Date.now() // Gera id único próprio
    };
    minhasFichas.push(novaFicha);
    localStorage.setItem('fichasRPG', JSON.stringify(minhasFichas));
    if (window.mostrarAlertaClonado) {
        window.mostrarAlertaClonado(personagem.info.nome);
    }
}