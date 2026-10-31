/**
 * Classes customizadas de erro da aplicacao.
 * Herdam de Error padrao do JavaScript para manter o stack trace original
 * e adicionam a propriedade statusCode para facilitar o mapeamento HTTP.
 */

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Captura o stack trace limpo omitindo o proprio construtor da classe
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro para falhas de validacao e regras de negocio (HTTP 400 Bad Request).
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/**
 * Erro para recursos nao encontrados (HTTP 404 Not Found).
 */
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError
};

