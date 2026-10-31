/**
 * Servico com todas as regras de negocio e validacoes de pedidos.
 * Nenhuma regra de validacao ou transicao deve ficar nos controllers ou repositorios.
 */

const pedidoRepository = require('../repositories/pedidoRepository');
const { ValidationError, NotFoundError } = require('../errors/AppError');
const {
  TIPOS_PERMITIDOS,
  PRIORIDADES_PERMITIDAS,
  STATUS,
  STATUS_PERMITIDOS,
  TRANSICOES_PERMITIDAS
} = require('../config/constants');

/**
 * Valida se um identificador e um numero inteiro positivo.
 * Lanca ValidationError (HTTP 400) se for invalido.
 * @param {string|number} id
 * @returns {number} ID convertido em numero inteiro
 */
function validarId(id) {
  const regexInteiroPositivo = /^[1-9]\d*$/;
  if (!regexInteiroPositivo.test(String(id).trim())) {
    throw new ValidationError('O ID do pedido deve ser um número inteiro positivo');
  }
  return parseInt(id, 10);
}

/**
 * Cadastra um novo pedido aplicando todas as validacoes de negocio.
 * @param {Object} dados
 * @returns {Object} Pedido cadastrado
 */
function cadastrarPedido(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new ValidationError('Corpo da requisição deve ser um objeto JSON válido');
  }

  const { cliente, tipo, valor, prioridade } = dados;

  // RF01 - Validacao de cliente: obrigatorio, tipo string, nao vazio mesmo apos trim()
  // O valor sera persistido limpo sem espacos adicionais nas pontas
  if (typeof cliente !== 'string' || cliente.trim().length === 0) {
    throw new ValidationError("O campo 'cliente' é obrigatório e não pode ser vazio");
  }

  // RF01 - Validacao de valor: obrigatorio, tipo number estrito (rejeita string, NaN, Infinity, null, boolean) e estritamente positivo (> 0)
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
    throw new ValidationError("O campo 'valor' deve ser um número maior que zero");
  }

  // RF01 - Validacao de tipo: restrito a 'entrega' ou 'retirada' (definido em constants.js)
  if (typeof tipo !== 'string' || !TIPOS_PERMITIDOS.includes(tipo)) {
    throw new ValidationError(
      `O campo 'tipo' deve ser um dos seguintes valores: ${TIPOS_PERMITIDOS.join(', ')}`
    );
  }

  // RF01 - Validacao de prioridade: restrito a 'baixa', 'normal' ou 'alta' (definido em constants.js)
  if (typeof prioridade !== 'string' || !PRIORIDADES_PERMITIDAS.includes(prioridade)) {
    throw new ValidationError(
      `O campo 'prioridade' deve ser um dos seguintes valores: ${PRIORIDADES_PERMITIDAS.join(', ')}`
    );
  }

  // Todo pedido nasce com status 'recebido' e cliente sem espacos sobressalentes
  return pedidoRepository.criar({
    cliente: cliente.trim(),
    tipo,
    valor,
    prioridade,
    status: STATUS.RECEBIDO
  });
}

/**
 * Retorna todos os pedidos existentes.
 * @returns {Array<Object>} Lista de pedidos
 */
function listarPedidos() {
  return pedidoRepository.listar();
}

/**
 * Localiza um pedido por ID.
 * Valida o formato do ID (400) e a existencia do pedido (404).
 * @param {string|number} idParam
 * @returns {Object} Pedido localizado
 */
function buscarPedidoPorId(idParam) {
  const id = validarId(idParam);
  const pedido = pedidoRepository.buscarPorId(id);

  if (!pedido) {
    throw new NotFoundError(`Pedido com ID ${id} não encontrado`);
  }

  return pedido;
}

/**
 * Atualiza o status de um pedido verificando a maquina de estados de transicao.
 * @param {string|number} idParam
 * @param {string} novoStatus
 * @returns {Object} Pedido com status atualizado
 */
function atualizarStatus(idParam, novoStatus) {
  const id = validarId(idParam);

  // Verifica se o pedido existe antes de validar status
  const pedido = pedidoRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError(`Pedido com ID ${id} não encontrado`);
  }

  // Validacao da presenca do status
  if (typeof novoStatus !== 'string' || novoStatus.trim().length === 0) {
    throw new ValidationError("O campo 'status' é obrigatório");
  }

  const statusFormatado = novoStatus.trim();

  // Validacao de status conhecido
  if (!STATUS_PERMITIDOS.includes(statusFormatado)) {
    throw new ValidationError(
      `Status '${statusFormatado}' é inválido. Valores permitidos: ${STATUS_PERMITIDOS.join(', ')}`
    );
  }

  // Validacao das regras de transicao de status
  const transicoesPermitidas = TRANSICOES_PERMITIDAS[pedido.status] || [];
  if (!transicoesPermitidas.includes(statusFormatado)) {
    throw new ValidationError(
      `Transição de status inválida: não é permitido alterar de '${pedido.status}' para '${statusFormatado}'`
    );
  }

  return pedidoRepository.atualizarStatus(id, statusFormatado);
}

module.exports = {
  validarId,
  cadastrarPedido,
  listarPedidos,
  buscarPedidoPorId,
  atualizarStatus
};

