/**
 * Controller de Pedidos.
 * Responsabilidade unica: intermediar a requisicao HTTP e o servico de dominio.
 * Extrai dados de req (body e params), chama o service correspondente e retorna
 * o status HTTP e JSON apropriados. Nao contem regras de validacao ou de negocio.
 */

const pedidoService = require('../services/pedidoService');

/**
 * Cria um novo pedido. Retorna HTTP 201 Created em caso de sucesso.
 */
function criar(req, res, next) {
  try {
    const pedidoCriado = pedidoService.cadastrarPedido(req.body);
    return res.status(201).json(pedidoCriado);
  } catch (error) {
    return next(error);
  }
}

/**
 * Lista todos os pedidos. Retorna HTTP 200 OK.
 */
function listar(req, res, next) {
  try {
    const pedidos = pedidoService.listarPedidos();
    return res.status(200).json(pedidos);
  } catch (error) {
    return next(error);
  }
}

/**
 * Busca um pedido especifico por ID. Retorna HTTP 200 OK ou 404 Not Found.
 */
function buscarPorId(req, res, next) {
  try {
    const pedido = pedidoService.buscarPedidoPorId(req.params.id);
    return res.status(200).json(pedido);
  } catch (error) {
    return next(error);
  }
}

/**
 * Atualiza o status de um pedido existente. Retorna HTTP 200 OK.
 */
function atualizarStatus(req, res, next) {
  try {
    const pedidoAtualizado = pedidoService.atualizarStatus(
      req.params.id,
      req.body ? req.body.status : undefined
    );
    return res.status(200).json(pedidoAtualizado);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizarStatus
};

