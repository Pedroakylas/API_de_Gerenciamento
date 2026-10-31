/**
 * Ponto de entrada para execucao do servidor HTTP.
 * Importa a configuracao de app.js e inicia a escuta na porta definida.
 */

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` API de Gerenciamento de Pedidos - Pedro Akylas (RGM: 45543232) & Rafaela Marques (RGM: 46321365)`);
  console.log(` Servidor em execucao na porta: ${PORT}`);
  console.log(` URL base: http://localhost:${PORT}`);
  console.log(` Endpoints: http://localhost:${PORT}/pedidos`);
  console.log(`====================================================`);
});

