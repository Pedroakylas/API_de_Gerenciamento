/**
 * Testes unitarios para a camada de servico (pedidoService).
 * Valida regras de negocio, validacao de campos e maquina de estados de transicao de status.
 */

const pedidoService = require('../src/services/pedidoService');
const pedidoRepository = require('../src/repositories/pedidoRepository');
const { ValidationError, NotFoundError } = require('../src/errors/AppError');
const { STATUS } = require('../src/config/constants');

describe('PedidoService - Testes Unitários de Regras de Negócio', () => {
  beforeEach(() => {
    // Garante isolamento total entre os testes limpando a memoria
    pedidoRepository.resetar();
  });

  describe('validarId', () => {
    test('deve aceitar inteiros positivos validos', () => {
      expect(pedidoService.validarId(1)).toBe(1);
      expect(pedidoService.validarId('42')).toBe(42);
      expect(pedidoService.validarId('999')).toBe(999);
    });

    test('deve lancar ValidationError para valores nao inteiros ou menores/iguais a zero', () => {
      expect(() => pedidoService.validarId('abc')).toThrow(ValidationError);
      expect(() => pedidoService.validarId('0')).toThrow(ValidationError);
      expect(() => pedidoService.validarId('-5')).toThrow(ValidationError);
      expect(() => pedidoService.validarId('1.5')).toThrow(ValidationError);
      expect(() => pedidoService.validarId('')).toThrow(ValidationError);
      expect(() => pedidoService.validarId(null)).toThrow(ValidationError);
    });
  });

  describe('cadastrarPedido', () => {
    test('deve cadastrar pedido com sucesso aplicando trim no cliente e status recebido', () => {
      const dados = {
        cliente: '  Maria Oliveira  ',
        tipo: 'entrega',
        valor: 150.5,
        prioridade: 'alta'
      };

      const pedido = pedidoService.cadastrarPedido(dados);

      expect(pedido).toHaveProperty('id', 1);
      expect(pedido.cliente).toBe('Maria Oliveira');
      expect(pedido.tipo).toBe('entrega');
      expect(pedido.valor).toBe(150.5);
      expect(pedido.prioridade).toBe('alta');
      expect(pedido.status).toBe(STATUS.RECEBIDO);
    });

    test('deve lancar erro quando dados nao forem um objeto valido', () => {
      expect(() => pedidoService.cadastrarPedido(null)).toThrow(ValidationError);
      expect(() => pedidoService.cadastrarPedido([])).toThrow(ValidationError);
    });

    test('deve lancar erro quando cliente estiver ausente, vazio ou apenas espacos', () => {
      expect(() => pedidoService.cadastrarPedido({
        cliente: '',
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      })).toThrow("O campo 'cliente' é obrigatório e não pode ser vazio");

      expect(() => pedidoService.cadastrarPedido({
        cliente: '   ',
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      })).toThrow("O campo 'cliente' é obrigatório e não pode ser vazio");

      expect(() => pedidoService.cadastrarPedido({
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      })).toThrow("O campo 'cliente' é obrigatório e não pode ser vazio");
    });

    test('deve lancar erro para valores invalidos (zero, negativo, string, NaN, booleano)', () => {
      const base = { cliente: 'Carlos', tipo: 'entrega', prioridade: 'normal' };

      expect(() => pedidoService.cadastrarPedido({ ...base, valor: 0 })).toThrow(
        "O campo 'valor' deve ser um número maior que zero"
      );
      expect(() => pedidoService.cadastrarPedido({ ...base, valor: -10 })).toThrow(
        "O campo 'valor' deve ser um número maior que zero"
      );
      expect(() => pedidoService.cadastrarPedido({ ...base, valor: '350' })).toThrow(
        "O campo 'valor' deve ser um número maior que zero"
      );
      expect(() => pedidoService.cadastrarPedido({ ...base, valor: NaN })).toThrow(
        "O campo 'valor' deve ser um número maior que zero"
      );
      expect(() => pedidoService.cadastrarPedido({ ...base, valor: true })).toThrow(
        "O campo 'valor' deve ser um número maior que zero"
      );
      expect(() => pedidoService.cadastrarPedido({ ...base })).toThrow(
        "O campo 'valor' deve ser um número maior que zero"
      );
    });

    test('deve lancar erro quando tipo for invalido', () => {
      const dados = {
        cliente: 'Carlos',
        tipo: 'expresso',
        valor: 200,
        prioridade: 'normal'
      };
      expect(() => pedidoService.cadastrarPedido(dados)).toThrow(
        "O campo 'tipo' deve ser um dos seguintes valores: entrega, retirada"
      );
    });

    test('deve lancar erro quando prioridade for invalida', () => {
      const dados = {
        cliente: 'Carlos',
        tipo: 'entrega',
        valor: 200,
        prioridade: 'urgente'
      };
      expect(() => pedidoService.cadastrarPedido(dados)).toThrow(
        "O campo 'prioridade' deve ser um dos seguintes valores: baixa, normal, alta"
      );
    });
  });

  describe('buscarPedidoPorId', () => {
    test('deve retornar o pedido se ele existir', () => {
      const criado = pedidoService.cadastrarPedido({
        cliente: 'Joao',
        tipo: 'retirada',
        valor: 50,
        prioridade: 'baixa'
      });

      const encontrado = pedidoService.buscarPedidoPorId(criado.id);
      expect(encontrado).toEqual(criado);
    });

    test('deve lancar NotFoundError se o ID for valido mas nao existir', () => {
      expect(() => pedidoService.buscarPedidoPorId(999)).toThrow(NotFoundError);
    });
  });

  describe('atualizarStatus - Maquina de Estados de Transição', () => {
    let pedidoId;

    beforeEach(() => {
      const pedido = pedidoService.cadastrarPedido({
        cliente: 'Cliente Teste',
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      });
      pedidoId = pedido.id;
    });

    test('deve permitir transicao: recebido -> em_preparacao', () => {
      const atualizado = pedidoService.atualizarStatus(pedidoId, STATUS.EM_PREPARACAO);
      expect(atualizado.status).toBe(STATUS.EM_PREPARACAO);
    });

    test('deve permitir transicao: recebido -> cancelado', () => {
      const atualizado = pedidoService.atualizarStatus(pedidoId, STATUS.CANCELADO);
      expect(atualizado.status).toBe(STATUS.CANCELADO);
    });

    test('deve permitir fluxo completo: recebido -> em_preparacao -> enviado -> entregue', () => {
      const passo1 = pedidoService.atualizarStatus(pedidoId, STATUS.EM_PREPARACAO);
      expect(passo1.status).toBe(STATUS.EM_PREPARACAO);

      const passo2 = pedidoService.atualizarStatus(pedidoId, STATUS.ENVIADO);
      expect(passo2.status).toBe(STATUS.ENVIADO);

      const passo3 = pedidoService.atualizarStatus(pedidoId, STATUS.ENTREGUE);
      expect(passo3.status).toBe(STATUS.ENTREGUE);
    });

    test('deve permitir cancelamento a partir de em_preparacao', () => {
      pedidoService.atualizarStatus(pedidoId, STATUS.EM_PREPARACAO);
      const cancelado = pedidoService.atualizarStatus(pedidoId, STATUS.CANCELADO);
      expect(cancelado.status).toBe(STATUS.CANCELADO);
    });

    test('deve rejeitar transicao invalida direta de recebido para entregue', () => {
      expect(() => pedidoService.atualizarStatus(pedidoId, STATUS.ENTREGUE)).toThrow(
        "Transição de status inválida: não é permitido alterar de 'recebido' para 'entregue'"
      );
    });

    test('deve rejeitar transicao invalida direta de recebido para enviado', () => {
      expect(() => pedidoService.atualizarStatus(pedidoId, STATUS.ENVIADO)).toThrow(
        "Transição de status inválida: não é permitido alterar de 'recebido' para 'enviado'"
      );
    });

    test('deve rejeitar transicao a partir de estado final (entregue)', () => {
      pedidoService.atualizarStatus(pedidoId, STATUS.EM_PREPARACAO);
      pedidoService.atualizarStatus(pedidoId, STATUS.ENVIADO);
      pedidoService.atualizarStatus(pedidoId, STATUS.ENTREGUE);

      expect(() => pedidoService.atualizarStatus(pedidoId, STATUS.CANCELADO)).toThrow(
        "Transição de status inválida: não é permitido alterar de 'entregue' para 'cancelado'"
      );
    });

    test('deve rejeitar transicao a partir de estado final (cancelado)', () => {
      pedidoService.atualizarStatus(pedidoId, STATUS.CANCELADO);

      expect(() => pedidoService.atualizarStatus(pedidoId, STATUS.EM_PREPARACAO)).toThrow(
        "Transição de status inválida: não é permitido alterar de 'cancelado' para 'em_preparacao'"
      );
    });

    test('deve rejeitar status desconhecido', () => {
      expect(() => pedidoService.atualizarStatus(pedidoId, 'desconhecido')).toThrow(
        "Status 'desconhecido' é inválido"
      );
    });

    test('deve rejeitar campo status ausente ou vazio', () => {
      expect(() => pedidoService.atualizarStatus(pedidoId, '')).toThrow(
        "O campo 'status' é obrigatório"
      );
      expect(() => pedidoService.atualizarStatus(pedidoId, null)).toThrow(
        "O campo 'status' é obrigatório"
      );
    });

    test('deve aplicar trim e aceitar status valido com espacos nas extremidades', () => {
      const atualizado = pedidoService.atualizarStatus(pedidoId, '  em_preparacao  ');
      expect(atualizado.status).toBe(STATUS.EM_PREPARACAO);
    });

    test('deve lancar NotFoundError para ID inexistente', () => {
      expect(() => pedidoService.atualizarStatus(888, STATUS.CANCELADO)).toThrow(
        NotFoundError
      );
    });
  });

  describe('Constantes e Imutabilidade', () => {
    test('todas as constantes de dominio devem ser imutaveis (congeladas)', () => {
      const {
        TIPOS_PERMITIDOS,
        PRIORIDADES_PERMITIDAS,
        STATUS,
        STATUS_PERMITIDOS,
        TRANSICOES_PERMITIDAS
      } = require('../src/config/constants');

      expect(Object.isFrozen(TIPOS_PERMITIDOS)).toBe(true);
      expect(Object.isFrozen(PRIORIDADES_PERMITIDAS)).toBe(true);
      expect(Object.isFrozen(STATUS)).toBe(true);
      expect(Object.isFrozen(STATUS_PERMITIDOS)).toBe(true);
      expect(Object.isFrozen(TRANSICOES_PERMITIDAS)).toBe(true);
    });

    test('repositorio deve retornar copia defensiva protegendo integridade dos dados', () => {
      pedidoService.cadastrarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      });

      const lista1 = pedidoRepository.listar();
      lista1[0].cliente = 'Nome Modificado Externamente';

      const lista2 = pedidoRepository.listar();
      expect(lista2[0].cliente).toBe('Pedro Akylas');
    });
  });
});

