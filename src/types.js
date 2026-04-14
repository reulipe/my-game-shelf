/**
 * @typedef {'fisica'|'digital'} TipoMidia
 * @typedef {'nao_iniciado'|'jogando'|'zerado'} StatusJogo
 * @typedef {'compra'|'assinatura'|'resgate_codigo'} LicencaTipo
 * @typedef {'ativa'|'expirada'|'removida'} StatusLicenca
 * @typedef {'disco'|'cartucho'|'colecionador'} FormatoFisico
 * @typedef {'novo'|'semi_novo'|'usado'} EstadoMidia
 *
 * @typedef {object} DetalhesMidiaDigital
 * @property {string} lojaDigital
 * @property {LicencaTipo} licencaTipo
 * @property {StatusLicenca} statusLicenca
 *
 * @typedef {object} DetalhesMidiaFisica
 * @property {FormatoFisico} formatoFisico
 * @property {EstadoMidia} estadoMidia
 * @property {string} regiao
 *
 * @typedef {object} Jogo
 * @property {number} id
 * @property {string} titulo
 * @property {string} plataforma
 * @property {TipoMidia} tipoMidia
 * @property {StatusJogo} status
 * @property {number|null|undefined} notaPessoal
 * @property {number|undefined} horasJogadas
 * @property {string|undefined} dataCompra
 * @property {number} precoPago
 * @property {string|undefined} moeda
 * @property {DetalhesMidiaDigital|DetalhesMidiaFisica} detalhesMidia
 */

export {};
