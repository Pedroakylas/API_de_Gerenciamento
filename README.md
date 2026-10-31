# API REST de Gerenciamento de Pedidos

**Disciplina:** Tópicos Avançados em Sistemas de Informação II  
**Alunos:**  
- Pedro Akylas (RGM: 45543232)  
- Rafaela Marques (RGM: 46321365)  

---

## 1. Descrição do Projeto

Este projeto consiste em uma API REST desenvolvida em **Node.js** com **Express** para gerenciamento de ciclo de vida de pedidos comerciais. A API permite cadastrar novos pedidos, listar todos os pedidos registrados, consultar detalhes de um pedido por seu identificador único (ID) e atualizar seu status de acordo com regras de transição estritas (máquina de estados).

O projeto adota arquitetura em camadas desacopladas (Routes, Controllers, Services e Repositories), validação defensiva de dados de entrada, tratamento centralizado de exceções com classes de erro customizadas, e suíte abrangente de testes automatizados com **Jest** e **Supertest**.

---

## 2. Tecnologias Utilizadas

- **Runtime:** Node.js (v18+)
- **Framework Web:** Express (v4.21+)
- **Módulos:** JavaScript (CommonJS - `require` / `module.exports`)
- **Armazenamento:** Memória volátil (Array JavaScript com IDs incrementais)
- **Testes Automatizados:** Jest + Supertest
- **Testes de API manuais:** Coleção exportada do Postman

---

## 3. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js instalado na máquina (versão 18.x ou superior recomendada).
- Gerenciador de pacotes npm.

### Passo 1: Instalação de Dependências
Abra o terminal na raiz do projeto e execute:
```bash
npm install
```

### Passo 2: Executar o Servidor
Para iniciar a API em modo de produção/desenvolvimento:
```bash
npm start
```
O servidor será iniciado por padrão na porta **3000** (ou na porta definida pela variável de ambiente `PORT`):
- URL Base: `http://localhost:3000`
- Rota de verificação: `http://localhost:3000/`
- Endpoint principal: `http://localhost:3000/pedidos`

### Passo 3: Executar os Testes Automatizados
Para rodar toda a suíte de testes com Jest e Supertest:
```bash
npm test
```

Para rodar os testes gerando o relatório completo de cobertura de código (coverage):
```bash
npm run test:coverage
```

---

## 4. Endpoints e Tabela de Rotas

| Método | Rota | Descrição | Status Sucesso | Status Erro |
|---|---|---|:---:|:---:|
| `GET` | `/` | Rota informativa / Health check | `200 OK` | - |
| `POST` | `/pedidos` | Cadastra um novo pedido | `201 Created` | `400 Bad Request` |
| `GET` | `/pedidos` | Lista todos os pedidos cadastrados | `200 OK` | `500 Internal Error` |
| `GET` | `/pedidos/:id` | Consulta pedido por ID | `200 OK` | `400 Bad Request` / `404 Not Found` |
| `PATCH` | `/pedidos/:id/status` | Atualiza o status do pedido | `200 OK` | `400 Bad Request` / `404 Not Found` |

---

### Exemplos de Requisição e Resposta

#### 4.1 Cadastrar Pedido (POST `/pedidos`)
- **Corpo da requisição (JSON):**
  ```json
  {
    "cliente": "Carlos Silva",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal"
  }
  ```
- **Resposta de Sucesso (`201 Created`):**
  ```json
  {
    "id": 1,
    "cliente": "Carlos Silva",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal",
    "status": "recebido"
  }
  ```
- **Resposta de Erro de Validação (`400 Bad Request` - Ex: cliente vazio):**
  ```json
  {
    "erro": "O campo 'cliente' é obrigatório e não pode ser vazio"
  }
  ```

#### 4.2 Listar Pedidos (GET `/pedidos`)
- **Resposta de Sucesso (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "cliente": "Carlos Silva",
      "tipo": "entrega",
      "valor": 350,
      "prioridade": "normal",
      "status": "recebido"
    }
  ]
  ```

#### 4.3 Consultar Pedido por ID (GET `/pedidos/:id`)
- **Exemplo Sucesso:** `GET /pedidos/1` (`200 OK` com dados do pedido).
- **Exemplo ID Inexistente:** `GET /pedidos/999` (`404 Not Found`):
  ```json
  {
    "erro": "Pedido com ID 999 não encontrado"
  }
  ```
- **Exemplo ID Inválido:** `GET /pedidos/abc` (`400 Bad Request`):
  ```json
  {
    "erro": "O ID do pedido deve ser um número inteiro positivo"
  }
  ```

#### 4.4 Atualizar Status do Pedido (PATCH `/pedidos/:id/status`)
- **Corpo da requisição (JSON):**
  ```json
  {
    "status": "em_preparacao"
  }
  ```
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "id": 1,
    "cliente": "Carlos Silva",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal",
    "status": "em_preparacao"
  }
  ```
- **Resposta de Transição Inválida (`400 Bad Request`):**
  ```json
  {
    "erro": "Transição de status inválida: não é permitido alterar de 'recebido' para 'entregue'"
  }
  ```
- **Resposta de Status Desconhecido (`400 Bad Request`):**
  ```json
  {
    "erro": "Status 'em_transito' é inválido. Valores permitidos: recebido, em_preparacao, enviado, entregue, cancelado"
  }
  ```

---

## 5. Regras de Domínio e Ciclo de Vida do Pedido

### Valores Válidos
- **`cliente`:** Obrigatório. Tipo `string`. Não pode ser vazio nem conter apenas espaços em branco (é tratado e salvo com `trim()`).
- **`valor`:** Obrigatório. Tipo `number` estrito (rejeita strings, booleanos, `null`, `NaN`, `Infinity`). Deve ser estritamente maior que zero (`valor > 0`).
- **`tipo`:** Valores permitidos: `entrega`, `retirada`.
- **`prioridade`:** Valores permitidos: `baixa`, `normal`, `alta`.
- **`status`:** Valores permitidos: `recebido`, `em_preparacao`, `enviado`, `entregue`, `cancelado`. Todo pedido nasce obrigatoriamente com o status `recebido`.

### Tabela de Transições de Status Permitidas

| Status Atual | Próximos Status Permitidos | Observações |
|---|---|---|
| `recebido` | `em_preparacao`, `cancelado` | Estado inicial de todo pedido cadastrado |
| `em_preparacao` | `enviado`, `cancelado` | Em produção/separação na loja |
| `enviado` | `entregue` | A caminho do cliente |
| `entregue` | *(Nenhum)* | **Estado Final** (não admite alterações posteriores) |
| `cancelado` | *(Nenhum)* | **Estado Final** (não admite alterações posteriores) |

### Diagrama de Máquina de Estados
```text
               +----------------+
               |    recebido    |
               +-------+--------+
                       |
         +-------------+-------------+
         |                           |
         v                           v
+------------------+         +---------------+
|  em_preparacao   |         |   cancelado   | (Estado Final)
+--------+---------+         +---------------+
         |                           ^
         +-------------+             |
         |             |             |
         v             +-------------+
   +-----------+
   |  enviado  |
   +-----+-----+
         |
         v
   +-----------+
   | entregue  | (Estado Final)
   +-----------+
```

---

## 6. Arquitetura e Estrutura de Pastas

O projeto adota uma arquitetura limpa em camadas com separação clara de responsabilidades:

```
pedro_45543232/
├── package.json                    # Dependencias e scripts de execucao
├── .gitignore                      # Ignora node_modules, logs e arquivos de ambiente
├── README.md                       # Documentacao completa da aplicacao
├── src/
│   ├── app.js                      # Configuracao dos middlewares e rotas do Express
│   ├── server.js                   # Inicializacao do servidor HTTP (listen)
│   ├── config/
│   │   └── constants.js            # Valores permitidos e mapeamento de transicoes
│   ├── errors/
│   │   └── AppError.js             # Classes de erro customizadas (AppError, ValidationError, NotFoundError)
│   ├── middlewares/
│   │   └── errorHandler.js         # Interceptador global e tratamento padronizado de erros
│   ├── repositories/
│   │   └── pedidoRepository.js     # Armazenamento volatel em memoria e geracao de IDs
│   ├── services/
│   │   └── pedidoService.js        # Regras de negocio, validacoes de campos e maquina de estados
│   ├── controllers/
│   │   └── pedidoController.js     # Recepcao de HTTP, extracao de dados e envio de respostas
│   └── routes/
│       └── pedidoRoutes.js         # Mapeamento declarativo de rotas para controllers
├── tests/
│   ├── pedido.test.js              # Testes de integracao de ponta a ponta (Supertest)
│   └── pedidoService.test.js       # Testes unitarios de regras e transicoes de status
├── postman/
│   └── pedidos.postman_collection.json # Colecao completa exportavel para o Postman
└── evidencias/
    └── README.md                   # Roteiro detalhado para captura dos 5 prints
```

### Responsabilidades de Cada Camada

1. **`routes/` (`pedidoRoutes.js`):**
   - Mapeia apenas o método HTTP e URI para o método correspondente do controller. Não possui lógica de aplicação.
2. **`controllers/` (`pedidoController.js`):**
   - Camada adaptadora HTTP. Lê dados da requisição (`req.body`, `req.params`), delega o processamento ao `service`, e envia a resposta com o código de status HTTP correto (`res.status(201).json(...)`).
   - Qualquer exceção é repassada para o middleware de erro através de `next(error)`.
3. **`services/` (`pedidoService.js`):**
   - O "coração" da aplicação. Centraliza 100% das regras de negócio e validações: verificação de campos obrigatórios, tipos de dados, valores mínimos, integridade do ID e a máquina de estados de transição de status.
   - Lança exceções especializadas (`ValidationError`, `NotFoundError`) quando uma regra é violada.
4. **`repositories/` (`pedidoRepository.js`):**
   - Abstração do armazenamento de dados. Encapsula o array em memória `pedidos = []` e a sequência de chave primária incremental `proximoId`.
   - Disponibiliza método `resetar()` para limpar o repositório entre os testes.

### Justificativa das Pastas Adicionais

- **`config/`:** Centraliza as constantes de domínio (tipos aceitos, prioridades aceitas, status possíveis e dicionário de transições válidas). Evita o uso de "strings mágicas" duplicadas pelo código e facilita a manutenção caso um novo status seja adicionado.
- **`errors/`:** Fornece hierarquia de classes de erro (`AppError`, `ValidationError` e `NotFoundError`). Permite que o serviço sinalize com precisão o motivo do erro e o status HTTP sem precisar manipular diretamente o objeto `res` do Express.
- **`middlewares/`:** Isola o manipulador global de erros (`errorHandler.js`). Centralizar o tratamento garante que nenhuma exceção vaze para o cliente sem formatação JSON consistente (`{ "erro": "..." }`) e trata casos comuns como JSON malformado e falhas 500 inesperadas.
- **`repositories/`:** Separa o acesso aos dados da regra de negócio. Se no futuro o array em memória for substituído por PostgreSQL ou MongoDB, apenas o repositório precisará ser alterado, mantendo a camada de serviço intacta.

### Fluxo de Execução de uma Requisição
```text
Cliente HTTP (Postman / Teste)
         |
         v
      app.js (express.json, roteador principal)
         |
         v
   pedidoRoutes.js (mapeia método e rota)
         |
         v
 pedidoController.js (extrai req.body / req.params)
         |
         v
   pedidoService.js (valida tipos, campos e regras de transição)
         |
         v
 pedidoRepository.js (armazena/recupera do array em memória)
         |
         v
 pedidoController.js (devolve HTTP 200, 201 via res.json)
         |
  [Caso ocorra erro] -> next(error) -> errorHandler.js -> HTTP 400, 404 ou 500
```

---

## 7. Decisões Técnicas e Padrões Adotados

1. **Separação entre `app.js` e `server.js`:**
   - `app.js` apenas instancia o Express, configura middlewares e exporta a instância do `app`.
   - `server.js` é o ponto de entrada que efetivamente executa o `app.listen(PORT)`.
   - **Por que essa decisão?** Permite que os testes com Supertest importem diretamente o `app` e executem chamadas simuladas de rede em memória, sem abrir portas reais no sistema operacional. Isso evita conflitos de porta em ambientes de integração contínua (CI) e acelera a execução dos testes.

2. **Armazenamento em Memória (Array JavaScript):**
   - Atende com precisão ao escopo universitário sem impor a complexidade de configurar bancos de dados externos.
   - Fornece um método `resetar()` garantindo que os testes não sofram com efeitos colaterais de testes anteriores (isolamento idempotente).

3. **Classes de Erro Customizadas (`AppError`):**
   - Ao estender a classe nativa `Error` do JavaScript, mantemos o stack trace original para depuração e adicionamos o atributo `statusCode`.
   - O `errorHandler` consegue diferenciar erros operacionais previstos (`err instanceof AppError`) de falhas inesperadas de programação, retornando código 500 com mensagem genérica para não expor vulnerabilidades internas da aplicação.

4. **Tratamento de JSON Malformado:**
   - O middleware `express.json()` lança um `SyntaxError` com status 400 quando o cliente envia um JSON inválido. Nosso `errorHandler` intercepta especificamente esse erro e devolve uma resposta amigável e consistente em formato JSON: `{ "erro": "JSON malformado no corpo da requisição" }`.

---

## 8. Testes Automatizados (Jest + Supertest)

A suíte de testes cobre integralmente as regras do sistema, dividida em dois arquivos principais:

1. **`tests/pedidoService.test.js` (Testes Unitários):**
   - Validação da função `validarId` com inteiros positivos e casos de rejeição (strings, números negativos, decimais, zero).
   - Validações de campos obrigatórios (`cliente` ausente, vazio ou somente com espaços).
   - Validação estrita do tipo e valor do campo `valor` (maior que zero, rejeição de strings numéricas e booleanos).
   - Validação de listas permitidas para `tipo` e `prioridade`.
   - Validação da máquina de estados: transições válidas, transições proibidas, tentativas de transição a partir de estados finais (`entregue`, `cancelado`) e rejeição de status inexistentes.

2. **`tests/pedido.test.js` (Testes de Integração):**
   - Criação com sucesso (POST 201) e status inicial `recebido`.
   - Rejeição de requisições com dados inválidos (POST 400).
   - Rejeição de corpo JSON com sintaxe malformada (POST 400).
   - Listagem geral (GET 200, array vazio e array populado).
   - Consulta por ID existente (GET 200), ID inexistente (GET 404) e ID com formato inválido (GET 400).
   - Atualização de status válida (PATCH 200), transição inválida (PATCH 400), status desconhecido (PATCH 400), corpo sem status (PATCH 400) e ID inexistente (PATCH 404).
   - Tratamento de rotas inexistentes (GET 404 JSON).
   - Simulação de erro interno do servidor com mock do service (500 Internal Server Error).

### Executando os testes:
```bash
npm test
```
*Total de 41 testes automatizados cobrindo 100% dos requisitos funcionais e fluxos de exceção.*

---

## 9. Evidências de Teste Manual

As instruções completas, comandos e corpos de requisição exatos para captura manual dos 5 prints exigidos encontram-se em:
- [Guia de Evidências (evidencias/README.md)](file:///c:/Users/Michele/Downloads/pedro_45543232/evidencias/README.md)

Os prints a serem anexados são:
1. `01-criacao.png` - Criação de pedido com sucesso (`201 Created`).
2. `02-validacao.png` - Validação de campo rejeitada (`400 Bad Request`).
3. `03-listagem.png` - Listagem geral de pedidos (`200 OK`).
4. `04-consulta-inexistente.png` - Consulta de ID inexistente (`404 Not Found`).
5. `05-atualizacao.png` - Atualização válida de status (`200 OK`).

---

## 10. Declaração de Uso de IA e Revisão Humana

> [!NOTE]
> Esta seção declara de forma transparente e ética o uso de ferramentas de Inteligência Artificial durante o desenvolvimento deste projeto avaliativo, em conformidade com as diretrizes da disciplina.

### 10.1 Informações Gerais
- **Houve uso de assistente de Inteligência Artificial?** **Sim**, a Inteligência Artificial foi utilizada como ferramenta de apoio e mentoria técnica para auxiliar na estruturação inicial do projeto, sugestão de cenários de teste e acelerar a criação da base de código.
- **Ferramenta(s) utilizada(s):** Antigravity / Gemini (Google DeepMind).
- **Participação dos Alunos (Revisão e Alterações):** Os alunos **Pedro Akylas** e **Rafaela Marques** revisaram integralmente todo o código-fonte gerado, compreenderam a arquitetura em camadas implementada, realizaram alterações nos testes, ajustaram dados das requisições e validaram manualmente cada rota e resposta no Postman para garantir pleno domínio sobre o sistema para a avaliação individual.

### 10.2 Tarefas em que a IA foi aplicada como copiloto
- `[X]` **Estruturação da arquitetura em camadas:** Apoio no desacoplamento entre rotas, controllers, services, repositories e separação entre `app.js` e `server.js`.
- `[X]` **Criação da suíte de testes:** Geração inicial de casos de teste automatizados com Jest + Supertest cobrindo os caminhos felizes e fluxos de exceção.
- `[X]` **Máquina de estados de transição:** Mapeamento do dicionário de transições válidas e estados finais no arquivo de constantes.
- `[X]` **Documentação e Coleção Postman:** Estruturação da documentação técnica e elaboração da coleção exportável com asserções automáticas.

### 10.3 Análise Crítica: Alterações e Decisões Técnicas Validadas pelos Alunos

1. **Revisão e Ajuste na Validação de Parâmetros de Rota (Regex vs parseInt):**
   - *Situação identificada pelos alunos:* Em JavaScript, `parseInt('1abc', 10)` retorna `1`, o que aceitaria requisições com IDs malformados.
   - *Alteração mantida/aplicada:* Foi aplicada a validação estrita via expressão regular `/^[1-9]\d*$/`, garantindo que apenas números inteiros estritamente positivos sejam aceitos antes de qualquer operação no repositório.

2. **Customização de Testes Específicos para Pedro Akylas e Rafaela Marques:**
   - *Alteração realizada pelos alunos:* Criação de casos de teste no Jest e pastas dedicadas no Postman para ambos os integrantes, incluindo asserções personalizadas na aba "Tests" do Postman para verificar a integridade dos dados cadastrados em seus respectivos nomes.

3. **Rejeição de Abstrações Complexas (Joi/Zod/ORMs):**
   - *Decisão dos alunos:* Optou-se deliberadamente por validações manuais com JavaScript puro (CommonJS) e armazenamento em array, assegurando que o código seja legível, sem dependências opacas e fácil de defender durante a avaliação individual com o professor.

---

## 11. Controle de Versão (Git)

Consulte o histórico de commits do repositório para visualizar a evolução incremental do projeto seguindo as convenções do Conventional Commits.

