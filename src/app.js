/**
 * Configuracao principal do aplicativo Express.
 * Separado de server.js para permitir testes de integracao com Supertest
 * sem precisar iniciar o servidor em uma porta de rede real.
 */

const express = require('express');
const pedidoRoutes = require('./routes/pedidoRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./errors/AppError');

const app = express();

// Habilita parsing de corpo de requisicao JSON
app.use(express.json());

// Rota inicial / boas-vindas informando autor e status da API
app.get('/', (req, res) => {
  res.status(200).json({
    projeto: 'API REST de Gerenciamento de Pedidos',
    disciplina: 'Tópicos Avançados em Sistemas de Informação II',
    aluno: 'Pedro Akylas',
    rgm: '45543232',
    alunos: [
      { nome: 'Pedro Akylas', rgm: '45543232' },
      { nome: 'Rafaela Marques', rgm: '46321365' }
    ],
    status: 'operacional'
  });
});

// Vincula as rotas de pedidos sob o prefixo /pedidos
app.use('/pedidos', pedidoRoutes);

// Captura de rotas inexistentes (404)
app.use((req, res, next) => {
  next(new NotFoundError(`Rota '${req.method} ${req.originalUrl}' não encontrada`));
});

// Middleware global de captura e tratamento de erros
app.use(errorHandler);

module.exports = app;

