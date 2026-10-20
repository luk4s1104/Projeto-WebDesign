// Exibe o modal injetando as propriedades do personagem
export function abrirModalVisualizacao(personagem, deQuem, modoEdicaoInicial = false) {
    const modal = document.getElementById('modalFicha');
    if (!modal) return;

    // Remove a classe hidden para exibir o modal na tela
    modal.classList.remove('hidden');

    // Preenche dados identificadores fundamentais
    document.getElementById('modalCharId').value = personagem.id;
    document.getElementById('modalTitle').textContent = modoEdicaoInicial ? `Editando: ${personagem.info.nome}` : `Ficha: ${personagem.info.nome}`;

    // Mapeia inputs de informações biográficas (Incluindo o Sexo)
    document.getElementById('modalName').value = personagem.info.nome || '';
    document.getElementById('modalSex').value = personagem.info.sexo || '';
    document.getElementById('modalLevel').value = personagem.info.nivel || 1;
    document.getElementById('modalClass').value = personagem.info.classe || '';
    document.getElementById('modalHealth').value = personagem.info.vidaMax || 0;
    document.getElementById('modalGift').value = personagem.info.dadiva || '';

    // Mapeia os atributos numéricos primários (BASE)
    document.getElementById('modalVit').value = personagem.atributos?.vitality?.base || 0;
    document.getElementById('modalFor').value = personagem.atributos?.strength?.base || 0;
    document.getElementById('modalDes').value = personagem.atributos?.dexterity?.base || 0;
    document.getElementById('modalRes').value = personagem.atributos?.resistence?.base || 0;
    document.getElementById('modalInt').value = personagem.atributos?.intelligence?.base || 0;
    document.getElementById('modalFaith').value = personagem.atributos?.faith?.base || 0;
    document.getElementById('modalHum').value = personagem.atributos?.humanity || 0;

    // NOVO MAPEAMENTO SEGURO: Modificadores (MOD)
    document.getElementById('modalVitMod').value = personagem.atributos?.vitality?.mod || 0;
    document.getElementById('modalForMod').value = personagem.atributos?.strength?.mod || 0;
    document.getElementById('modalDesMod').value = personagem.atributos?.dexterity?.mod || 0;
    document.getElementById('modalResMod').value = personagem.atributos?.resistence?.mod || 0;
    document.getElementById('modalIntMod').value = personagem.atributos?.intelligence?.mod || 0;
    document.getElementById('modalFaithMod').value = personagem.atributos?.faith?.mod || 0;

    // NOVO MAPEAMENTO SEGURO: Modificadores + Nível (M+N)
    document.getElementById('modalVitModLvl').value = personagem.atributos?.vitality?.modLevel || 0;
    document.getElementById('modalForModLvl').value = personagem.atributos?.strength?.modLevel || 0;
    document.getElementById('modalDesModLvl').value = personagem.atributos?.dexterity?.modLevel || 0;
    document.getElementById('modalResModLvl').value = personagem.atributos?.resistence?.modLevel || 0;
    document.getElementById('modalIntModLvl').value = personagem.atributos?.intelligence?.modLevel || 0;
    document.getElementById('modalFaithModLvl').value = personagem.atributos?.faith?.modLevel || 0;

    // Mapeia as caixas de textos longos se elas existirem na página
    const txtSpells = document.getElementById('modalSpells');
    if (txtSpells) txtSpells.value = personagem.detalhes?.feiticos || '';

    const txtEquip = document.getElementById('modalEquipment');
    if (txtEquip) txtEquip.value = personagem.detalhes?.equipment || personagem.detalhes?.equipamento || '';

    const txtItems = document.getElementById('modalItems');
    if (txtItems) txtItems.value = personagem.detalhes?.itensMochila || '';

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
    const inputs = document.querySelectorAll('#modalForm input:not([type="hidden"]), #modalForm textarea');
    inputs.forEach(input => {
        if (podeEditar) {
            // Em modo de edição, permitimos estilização de escrita, mas os modificadores calculados continuam trancados por segurança
            const id = input.getAttribute('id');
            if (id && (id.includes('Mod') || id.includes('ModLvl'))) {
                input.setAttribute('readonly', 'true');
                input.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
                input.style.borderColor = 'rgba(39, 53, 68, 0.4)';
            } else {
                input.removeAttribute('readonly');
                input.style.backgroundColor = '#1b242f';
                input.style.borderColor = '#1c6ba0';
            }
        } else {
            input.setAttribute('readonly', 'true');
            input.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
            input.style.borderColor = 'rgba(39, 53, 68, 0.4)';
        }
    });
}

function configurarBotoesRodape(personagem, deQuem, estaEditando) {
    const footer = document.getElementById('modalFooterActions');
    if (!footer) return;
    footer.innerHTML = ''; // Reseta o rodapé anterior

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
        // Se veio da biblioteca pública da comunidade
        const btnClonar = document.createElement('button');
        btnClonar.className = 'btn btn-primary';
        btnClonar.style.backgroundColor = '#1a5c38';
        btnClonar.textContent = 'Clonar para Meu Panel';
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
        // Atualiza as informações biográficas principais (Incluindo o novo campo Sexo)
        bancoFichas[index].info.nome = document.getElementById('modalName').value;
        bancoFichas[index].info.sexo = document.getElementById('modalSex').value;
        bancoFichas[index].info.nivel = document.getElementById('modalLevel').value;
        bancoFichas[index].info.classe = document.getElementById('modalClass').value;
        bancoFichas[index].info.vidaMax = document.getElementById('modalHealth').value;
        bancoFichas[index].info.dadiva = document.getElementById('modalGift').value;

        // Atualiza os valores base de atributos
        bancoFichas[index].atributos.vitality.base = document.getElementById('modalVit').value;
        bancoFichas[index].atributos.strength.base = document.getElementById('modalFor').value;
        bancoFichas[index].atributos.dexterity.base = document.getElementById('modalDes').value;
        bancoFichas[index].atributos.resistence.base = document.getElementById('modalRes').value;
        bancoFichas[index].atributos.intelligence.base = document.getElementById('modalInt').value;
        bancoFichas[index].atributos.faith.base = document.getElementById('modalFaith').value;
        bancoFichas[index].atributos.humanity = document.getElementById('modalHum').value;

        // Garante a integridade dos sub-objetos de modificadores calculados
        bancoFichas[index].atributos.vitality.mod = document.getElementById('modalVitMod').value;
        bancoFichas[index].atributos.strength.mod = document.getElementById('modalForMod').value;
        bancoFichas[index].atributos.dexterity.mod = document.getElementById('modalDesMod').value;
        bancoFichas[index].atributos.resistence.mod = document.getElementById('modalResMod').value;
        bancoFichas[index].atributos.intelligence.mod = document.getElementById('modalIntMod').value;
        bancoFichas[index].atributos.faith.mod = document.getElementById('modalFaithMod').value;

        bancoFichas[index].atributos.vitality.modLevel = document.getElementById('modalVitModLvl').value;
        bancoFichas[index].atributos.strength.modLevel = document.getElementById('modalForModLvl').value;
        bancoFichas[index].atributos.dexterity.modLevel = document.getElementById('modalDesModLvl').value;
        bancoFichas[index].atributos.resistence.modLevel = document.getElementById('modalResModLvl').value;
        bancoFichas[index].atributos.intelligence.modLevel = document.getElementById('modalIntModLvl').value;
        bancoFichas[index].atributos.faith.modLevel = document.getElementById('modalFaithModLvl').value;

        // Salva as modificações das textareas se existirem no objeto original
        if (!bancoFichas[index].detalhes) {
            bancoFichas[index].detalhes = { feiticos: '', equipamento: '', itensMochila: '' };
        }
        
        const txtSpells = document.getElementById('modalSpells');
        if (txtSpells) bancoFichas[index].detalhes.feiticos = txtSpells.value;

        const txtEquip = document.getElementById('modalEquipment');
        if (txtEquip) bancoFichas[index].detalhes.equipamento = txtEquip.value;

        const txtItems = document.getElementById('modalItems');
        if (txtItems) bancoFichas[index].detalhes.itensMochila = txtItems.value;

        localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));
    }
}

function clonarFichaComunidade(personagem) {
    let minhasFichas = JSON.parse(localStorage.getItem('fichasRPG')) || [];
    const novaFicha = {
        ...personagem,
        id: Date.now(), // Gera id único temporal próprio
        info: { ...personagem.info, autor: "@Voce" } // Assume a autoria privada
    };
    minhasFichas.push(novaFicha);
    localStorage.setItem('fichasRPG', JSON.stringify(minhasFichas));
    
    // Tenta invocar a interface de alerta da biblioteca ou exibe um fallback seguro
    if (window.mostrarAlertaClonado) {
        window.mostrarAlertaClonado(personagem.info.nome);
    } else {
        alert(`A ficha do(a) ${personagem.info.nome} foi clonada com sucesso!`);
    }
}