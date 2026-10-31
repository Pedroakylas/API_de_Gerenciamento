const { AppError } = require('../errors/AppError');

/**
 * Middleware centralizado de tratamento de erros do Express.
 * Importante: Deve sempre receber 4 parametros (err, req, res, next)
 * para que o Express o reconheca como manipulador de erros.
 */
function errorHandler(err, req, res, next) {
  // Trata erro de JSON malformado enviado pelo cliente (capturado pelo express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      erro: 'JSON malformado no corpo da requisição'
    });
  }

  // Trata erros controlados de negocio e validacao (AppError, ValidationError, NotFoundError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      erro: err.message
    });
  }

  // Erros inesperados do sistema (ex.: falha de runtime, ponteiro nulo, etc.)
  // Logamos o erro real no console para depuracao e respondemos com 500 generico
  console.error('Erro inesperado:', err);

  return res.status(500).json({
    erro: 'Erro interno do servidor'
  });
}

module.exports = errorHandler;

