/**
 * Testes de integracao dos endpoints HTTP da API de Pedidos.
 * Utiliza Supertest para enviar requisicoes reais contra a aplicacao Express (app.js).
 */

const request = require('supertest');
const app = require('../src/app');
const pedidoRepository = require('../src/repositories/pedidoRepository');
const pedidoService = require('../src/services/pedidoService');

describe('API de Pedidos - Testes de Integração', () => {
  beforeEach(() => {
    // Isolamento: garante que cada teste execute com a memoria limpa
    pedidoRepository.resetar();
    jest.restoreAllMocks();
  });

  describe('GET / (Rota Raiz)', () => {
    test('deve responder 200 com informacoes do projeto e autores', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('aluno', 'Pedro Akylas');
      expect(res.body).toHaveProperty('rgm', '45543232');
      expect(res.body).toHaveProperty('alunos');
      expect(res.body.alunos).toEqual([
        { nome: 'Pedro Akylas', rgm: '45543232' },
        { nome: 'Rafaela Marques', rgm: '46321365' }
      ]);
    });
  });

  describe('POST /pedidos', () => {
    test('deve criar um pedido valido com status 201 e status inicial recebido', async () => {
      const payload = {
        cliente: '  Carlos Silva  ',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      };

      const res = await request(app)
        .post('/pedidos')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 1,
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });
    });

    test('deve criar um pedido valido para a aluna/cliente Rafaela Marques (RGM: 46321365)', async () => {
      const payload = {
        cliente: '  Rafaela Marques  ',
        tipo: 'retirada',
        valor: 450,
        prioridade: 'alta'
      };

      const res = await request(app)
        .post('/pedidos')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 1,
        cliente: 'Rafaela Marques',
        tipo: 'retirada',
        valor: 450,
        prioridade: 'alta',
        status: 'recebido'
      });
    });

    test('deve retornar 400 se cliente estiver ausente, vazio ou contiver apenas espacos', async () => {
      const semCliente = { tipo: 'entrega', valor: 100, prioridade: 'baixa' };
      const clienteVazio = { cliente: '', tipo: 'entrega', valor: 100, prioridade: 'baixa' };
      const clienteEspacos = { cliente: '    ', tipo: 'entrega', valor: 100, prioridade: 'baixa' };

      for (const payload of [semCliente, clienteVazio, clienteEspacos]) {
        const res = await request(app).post('/pedidos').send(payload);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('erro');
        expect(res.body.erro).toContain("'cliente' é obrigatório");
      }
    });

    test('deve retornar 400 se valor for zero, negativo, string ou ausente', async () => {
      const base = { cliente: 'Carlos Silva', tipo: 'entrega', prioridade: 'normal' };

      const cenarios = [
        { ...base, valor: 0 },
        { ...base, valor: -50 },
        { ...base, valor: '350' },
        { ...base }
      ];

      for (const payload of cenarios) {
        const res = await request(app).post('/pedidos').send(payload);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('erro');
        expect(res.body.erro).toContain("'valor' deve ser um número maior que zero");
      }
    });

    test('deve retornar 400 se tipo for invalido', async () => {
      const payload = {
        cliente: 'Carlos Silva',
        tipo: 'sedex',
        valor: 150,
        prioridade: 'normal'
      };

      const res = await request(app).post('/pedidos').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
      expect(res.body.erro).toContain("O campo 'tipo' deve ser um dos seguintes valores");
    });

    test('deve retornar 400 se prioridade for invalida', async () => {
      const payload = {
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 150,
        prioridade: 'urgente'
      };

      const res = await request(app).post('/pedidos').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
      expect(res.body.erro).toContain("O campo 'prioridade' deve ser um dos seguintes valores");
    });

    test('deve retornar 400 se o corpo JSON for malformado', async () => {
      const res = await request(app)
        .post('/pedidos')
        .set('Content-Type', 'application/json')
        .send('{"cliente": "Carlos", valor: 100}'); // JSON com sintaxe invalida

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: 'JSON malformado no corpo da requisição'
      });
    });
  });

  describe('GET /pedidos', () => {
    test('deve retornar lista vazia (200) quando nao houver pedidos cadastrados', async () => {
      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('deve retornar lista com pedidos cadastrados (200)', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Cliente 1',
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      });

      await request(app).post('/pedidos').send({
        cliente: 'Cliente 2',
        tipo: 'retirada',
        valor: 200,
        prioridade: 'alta'
      });

      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].cliente).toBe('Cliente 1');
      expect(res.body[1].cliente).toBe('Cliente 2');
    });
  });

  describe('GET /pedidos/:id', () => {
    test('deve retornar 200 e os dados do pedido quando o ID existir', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });

      const res = await request(app).get(`/pedidos/${criado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(criado.body.id);
      expect(res.body.cliente).toBe('Carlos Silva');
    });

    test('deve retornar 404 quando o ID for um numero valido mas inexistente', async () => {
      const res = await request(app).get('/pedidos/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: 'Pedido com ID 999 não encontrado'
      });
    });

    test('deve retornar 400 quando o ID for invalido (ex: string "abc", "0", negativo)', async () => {
      const resAbc = await request(app).get('/pedidos/abc');
      expect(resAbc.status).toBe(400);
      expect(resAbc.body).toEqual({
        erro: 'O ID do pedido deve ser um número inteiro positivo'
      });

      const resZero = await request(app).get('/pedidos/0');
      expect(resZero.status).toBe(400);

      const resNegativo = await request(app).get('/pedidos/-5');
      expect(resNegativo.status).toBe(400);
    });
  });

  describe('PATCH /pedidos/:id/status', () => {
    let pedidoId;

    beforeEach(async () => {
      const res = await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      pedidoId = res.body.id;
    });

    test('deve atualizar o status para valido (200)', async () => {
      const res = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ status: 'em_preparacao' });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(pedidoId);
      expect(res.body.status).toBe('em_preparacao');
    });

    test('deve retornar 400 para transicao invalida', async () => {
      // De 'recebido' direto para 'entregue' e invalido
      const res = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ status: 'entregue' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "Transição de status inválida: não é permitido alterar de 'recebido' para 'entregue'"
      });
    });

    test('deve retornar 400 para status desconhecido', async () => {
      const res = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ status: 'em_transito' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toContain("Status 'em_transito' é inválido");
    });

    test('deve retornar 400 quando corpo nao possuir status', async () => {
      const res = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "O campo 'status' é obrigatório"
      });
    });

    test('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .patch('/pedidos/999/status')
        .send({ status: 'cancelado' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: 'Pedido com ID 999 não encontrado'
      });
    });

    test('deve retornar 400 para ID com formato invalido', async () => {
      const res = await request(app)
        .patch('/pedidos/invalido/status')
        .send({ status: 'cancelado' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: 'O ID do pedido deve ser um número inteiro positivo'
      });
    });
  });

  describe('Tratamento de Rotas Inexistentes e Erros Inesperados (500)', () => {
    test('deve responder 404 em formato JSON para rota nao existente', async () => {
      const res = await request(app).get('/rota-inexistente');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
      expect(res.body.erro).toContain("Rota 'GET /rota-inexistente' não encontrada");
    });

    test('deve retornar 500 com mensagem generica quando ocorrer erro inesperado no service', async () => {
      // Mock do console.error para nao poluir a saida dos testes
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Forca pedidoService.listarPedidos a lancar um erro inesperado generico
      jest.spyOn(pedidoService, 'listarPedidos').mockImplementation(() => {
        throw new Error('Falha de memoria inesperada no servidor');
      });

      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        erro: 'Erro interno do servidor'
      });

      expect(spyConsole).toHaveBeenCalled();
      spyConsole.mockRestore();
    });
  });
});

