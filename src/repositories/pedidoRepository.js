/**
 * Repositorio responsavel pelo armazenamento e consulta de pedidos em memoria.
 * Simula a persistencia de um banco de dados utilizando um array JavaScript.
 */

let pedidos = [];
let proximoId = 1;

/**
 * Cadastra um novo pedido no array em memoria gerando um ID incremental.
 * @param {Object} dadosPedido
 * @returns {Object} Pedido recem-criado
 */
function criar(dadosPedido) {
  const novoPedido = {
    id: proximoId++,
    cliente: dadosPedido.cliente,
    tipo: dadosPedido.tipo,
    valor: dadosPedido.valor,
    prioridade: dadosPedido.prioridade,
    status: dadosPedido.status
  };

  pedidos.push(novoPedido);
  return { ...novoPedido };
}

/**
 * Retorna todos os pedidos cadastrados.
 * Retorna uma copia dos objetos para proteger o array interno contra mutacoes externas.
 * @returns {Array<Object>} Lista de pedidos
 */
function listar() {
  return pedidos.map(pedido => ({ ...pedido }));
}

/**
 * Localiza um pedido pelo ID.
 * @param {number} id
 * @returns {Object|null} Objeto do pedido ou null se nao encontrado
 */
function buscarPorId(id) {
  const pedido = pedidos.find(p => p.id === Number(id));
  return pedido ? { ...pedido } : null;
}

/**
 * Atualiza o status de um pedido existente.
 * @param {number} id
 * @param {string} novoStatus
 * @returns {Object|null} Pedido atualizado ou null se nao encontrado
 */
function atualizarStatus(id, novoStatus) {
  const pedido = pedidos.find(p => p.id === Number(id));
  if (!pedido) {
    return null;
  }

  pedido.status = novoStatus;
  return { ...pedido };
}

/**
 * Restaura o estado inicial do repositorio (limpa array e reinicia ID).
 * Essencial para o isolamento dos testes automatizados (executado no beforeEach).
 */
function resetar() {
  pedidos = [];
  proximoId = 1;
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizarStatus,
  resetar
};

