let nextId = 1;
/** @type {import('../types.js').Jogo[]} */
const jogos = [];

/**
 * @param {Omit<import('../types.js').Jogo, 'id'>} dados
 * @returns {import('../types.js').Jogo}
 */
export function criarJogo(dados) {
  const jogo = { id: nextId++, ...dados };
  jogos.push(jogo);
  return jogo;
}

/** @returns {import('../types.js').Jogo[]} */
export function listarJogos() {
  return [...jogos];
}

/** Limpa a estante e reinicia o contador de ids (útil em testes). */
export function resetJogosStore() {
  jogos.length = 0;
  nextId = 1;
}
