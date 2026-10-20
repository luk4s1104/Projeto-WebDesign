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
            // CORREÇÃO: Removemos a trava que impedia a edição dos campos Mod e ModLvl
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
                
                // CORREÇÃO: Invoca aplicarFiltros para atualizar o cartão no ecrã preservando os filtros ativos
                if (window.aplicarFiltros) {
                    window.aplicarFiltros();
                } else if (window.renderizarFichasSalvas) {
                    window.renderizarFichasSalvas();
                }
            };
        } else {
            btnAcao.textContent = 'Habilitar Edição';
            btnAcao.onclick = () => {
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
    
    // Garante obtenção do ID seja por parâmetro ou pelo input hidden do modal
    const targetId = id || document.getElementById('modalCharId').value;
    
    // CORREÇÃO: Converte ambos para string na comparação para evitar falhas de tipo (Number vs String)
    const index = bancoFichas.findIndex(p => String(p.id) === String(targetId));

    if (index !== -1) {
        // Garante que os objetos base existam para evitar erros
        if (!bancoFichas[index].info) bancoFichas[index].info = {};
        if (!bancoFichas[index].atributos) bancoFichas[index].atributos = {};

        // Atualiza as informações biográficas principais
        bancoFichas[index].info.nome = document.getElementById('modalName').value;
        bancoFichas[index].info.sexo = document.getElementById('modalSex').value;
        bancoFichas[index].info.nivel = document.getElementById('modalLevel').value;
        bancoFichas[index].info.classe = document.getElementById('modalClass').value;
        bancoFichas[index].info.vidaMax = document.getElementById('modalHealth').value;
        bancoFichas[index].info.dadiva = document.getElementById('modalGift').value;

        // Função auxiliar segura para atualizar cada atributo
        const atualizarAtributo = (prop, baseId, modId, modLvlId) => {
            if (!bancoFichas[index].atributos[prop]) {
                bancoFichas[index].atributos[prop] = { base: "0", mod: "0", modLevel: "0" };
            }
            const baseEl = document.getElementById(baseId);
            const modEl = document.getElementById(modId);
            const modLvlEl = document.getElementById(modLvlId);

            if (baseEl) bancoFichas[index].atributos[prop].base = baseEl.value;
            if (modEl) bancoFichas[index].atributos[prop].mod = modEl.value;
            if (modLvlEl) bancoFichas[index].atributos[prop].modLevel = modLvlEl.value;
        };

        atualizarAtributo('vitality', 'modalVit', 'modalVitMod', 'modalVitModLvl');
        atualizarAtributo('strength', 'modalFor', 'modalForMod', 'modalForModLvl');
        atualizarAtributo('dexterity', 'modalDes', 'modalDesMod', 'modalDesModLvl');
        atualizarAtributo('resistence', 'modalRes', 'modalResMod', 'modalResModLvl');
        atualizarAtributo('intelligence', 'modalInt', 'modalIntMod', 'modalIntModLvl');
        atualizarAtributo('faith', 'modalFaith', 'modalFaithMod', 'modalFaithModLvl');

        const humEl = document.getElementById('modalHum');
        if (humEl) {
            bancoFichas[index].atributos.humanity = humEl.value;
        }

        // Atualiza caixas de texto longas (detalhes)
        if (!bancoFichas[index].detalhes) {
            bancoFichas[index].detalhes = { feiticos: '', equipamento: '', itensMochila: '' };
        }
        
        const txtSpells = document.getElementById('modalSpells');
        if (txtSpells) bancoFichas[index].detalhes.feiticos = txtSpells.value;

        const txtEquip = document.getElementById('modalEquipment');
        if (txtEquip) bancoFichas[index].detalhes.equipamento = txtEquip.value;

        const txtItems = document.getElementById('modalItems');
        if (txtItems) bancoFichas[index].detalhes.itensMochila = txtItems.value;

        // Persiste de verdade as alterações no navegador
        localStorage.setItem('fichasRPG', JSON.stringify(bancoFichas));
        console.log("Ficha atualizada com sucesso no localStorage!");
    } else {
        console.error("Erro: Personagem não encontrado no localStorage. ID procurado:", targetId);
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