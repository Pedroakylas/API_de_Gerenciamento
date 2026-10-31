/**
 * Constantes e configuracoes de dominio da API de Pedidos.
 * Centralizar essas definicoes evita valores "magicos" (magic strings) espalhados no codigo
 * e facilita a manutencao e explicacao durante a avaliacao.
 */

const TIPOS_PERMITIDOS = Object.freeze(['entrega', 'retirada']);

const PRIORIDADES_PERMITIDAS = Object.freeze(['baixa', 'normal', 'alta']);

const STATUS = Object.freeze({
  RECEBIDO: 'recebido',
  EM_PREPARACAO: 'em_preparacao',
  ENVIADO: 'enviado',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado'
});

const STATUS_PERMITIDOS = Object.freeze(Object.values(STATUS));

/**
 * Mapeamento de transicoes de status permitidas:
 * - recebido -> em_preparacao | cancelado
 * - em_preparacao -> enviado | cancelado
 * - enviado -> entregue
 * - entregue -> nenhuma (estado final)
 * - cancelado -> nenhuma (estado final)
 */
const TRANSICOES_PERMITIDAS = Object.freeze({
  [STATUS.RECEBIDO]: Object.freeze([STATUS.EM_PREPARACAO, STATUS.CANCELADO]),
  [STATUS.EM_PREPARACAO]: Object.freeze([STATUS.ENVIADO, STATUS.CANCELADO]),
  [STATUS.ENVIADO]: Object.freeze([STATUS.ENTREGUE]),
  [STATUS.ENTREGUE]: Object.freeze([]),
  [STATUS.CANCELADO]: Object.freeze([])
});

module.exports = {
  TIPOS_PERMITIDOS,
  PRIORIDADES_PERMITIDAS,
  STATUS,
  STATUS_PERMITIDOS,
  TRANSICOES_PERMITIDAS
};

