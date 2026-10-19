/**
 * Injeta a estrutura física invisível do modal vindo do components.html
 * @param {string} pathToComponents - O caminho relativo até o arquivo components.html
 */
export async function carregarComponenteModal(pathToComponents = "../pages/components.html") {
    try {
        const response = await fetch(pathToComponents);
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

/**
 * Processes comparison rules between a character data object and active filter search states.
 * @param {Object} character - The character data object.
 * @param {string} searchStr - Cleaned character or author name search string.
 * @param {string} classStr - Cleaned class designation search string.
 * @param {string} levelStr - Cleaned numeric progression level search string.
 * @returns {boolean} True if the character matches all active criteria simultaneously.
 */
export function matchFilterRules(character, searchStr, classStr, levelStr) {
    const charName = (character.info?.nome || "").toLowerCase();
    const charClass = (character.info?.classe || "").toLowerCase();
    const charLevel = parseInt(character.info?.nivel, 10) || 0;

    const matchesName = searchStr === '' || charName.includes(searchStr);
    const matchesClass = classStr === '' || charClass.includes(classStr);
    const matchesLevel = levelStr === '' || charLevel >= parseInt(levelStr, 10);

    return matchesName && matchesClass && matchesLevel;
}

/**
 * Universally binds text and numerical 'input' listeners to document search boxes.
 * @param {Function} onInputCallback - The callback function to run instantly when a user types.
 */
export function bindFilterInputs(onInputCallback) {
    const inputSearch = document.getElementById('pesquisar');
    const inputClass = document.getElementById('classe');
    const inputLevel = document.getElementById('nivel');

    if (inputSearch) inputSearch.addEventListener('input', onInputCallback);
    if (inputClass) inputClass.addEventListener('input', onInputCallback);
    if (inputLevel) inputLevel.addEventListener('input', onInputCallback);
}