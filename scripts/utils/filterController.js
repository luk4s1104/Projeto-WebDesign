/**
 * Processes comparison rules between a character data object and active filter search states.
 * @param {Object} character - The character data object.
 * @param {string} searchStr - Cleaned character or author name search string.
 * @param {string} classStr - Cleaned class designation search string.
 * @param {string} levelStr - Cleaned numeric progression level search string.
 * @returns {boolean} True if the character matches all active criteria simultaneously.
 */
export function matchFilterRules(character, searchStr, classStr, levelStr) {
    // CAPTURA SEGURO: Garante compatibilidade tanto com a biblioteca quanto com o painel privado
    const charName = (character.info?.nome || "").toLowerCase();
    const charClass = (character.info?.classe || "").toLowerCase();
    
    // Tenta pegar 'nivel' (da biblioteca) ou 'nivel' (dos formulários salvos)
    const rawLevel = character.info?.nivel || character.info?.nivel || 0;
    const charLevel = parseInt(rawLevel, 10) || 0;

    // Se veio da biblioteca, podemos validar o autor também na barra de pesquisa
    const charAuthor = (character.info?.autor || "").toLowerCase();

    // REGRAS DE FILTRAGEM:
    // A busca por nome agora aceita tanto o nome do personagem quanto o @criador
    const matchesName = searchStr === '' || charName.includes(searchStr) || charAuthor.includes(searchStr);
    const matchesClass = classStr === '' || charClass.includes(classStr);
    const matchesLevel = levelStr === '' || charLevel >= parseInt(levelStr, 10);

    return matchesName && matchesClass && matchesLevel;
}