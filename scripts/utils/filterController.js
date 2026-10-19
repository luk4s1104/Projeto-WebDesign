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