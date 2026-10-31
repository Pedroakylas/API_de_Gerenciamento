/**
 * Rotas do recurso Pedidos.
 * Responsabilidade: Mapear os verbos HTTP e caminhos para seus respectivos controllers.
 */

const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// POST /pedidos -> Cadastrar pedido
router.post('/', pedidoController.criar);

// GET /pedidos -> Listar pedidos
router.get('/', pedidoController.listar);

// GET /pedidos/:id -> Consultar pedido por ID
router.get('/:id', pedidoController.buscarPorId);

// PATCH /pedidos/:id/status -> Atualizar status do pedido
router.patch('/:id/status', pedidoController.atualizarStatus);

module.exports = router;

