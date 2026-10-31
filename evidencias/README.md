# Guia de Evidências de Testes da API

**Alunos:**  
- Pedro Akylas (RGM: 45543232)  
- Rafaela Marques (RGM: 46321365)  
**Disciplina:** Tópicos Avançados em Sistemas de Informação II  

---

## Instruções para os Alunos

Este diretório armazena as **5 capturas de tela (prints)** solicitadas para comprovação da execução e funcionamento da API.

> [!IMPORTANT]
> Cada print deve ser tirado no **Postman** mostrando com clareza:
> 1. **Método HTTP** (POST, GET, PATCH);
> 2. **URL completa** da requisição (ex.: `http://localhost:3000/pedidos`);
> 3. **Aba Body e Corpo da Requisição** (quando houver payload JSON);
> 4. **Código de Status HTTP** retornado (ex.: `201 Created`, `400 Bad Request`, `200 OK`, `404 Not Found`);
> 5. **Corpo da Resposta (Response JSON)** formatado;
> 6. **Aba "Tests" / "Test Results"** do Postman: mostrando os testes automatizados com sucesso (`PASS`).

---

## Lista dos 5 Prints a Serem Capturados

### 1. `01-criacao.png`
- **Cenário:** Cadastro de Pedido com Dados Válidos (Sucesso - Pedro Akylas ou Rafaela Marques).
- **Método:** `POST`
- **URL:** `http://localhost:3000/pedidos`
- **Headers:** `Content-Type: application/json`
- **Corpo da Requisição (Body raw JSON):**
  ```json
  {
    "cliente": "Pedro Akylas",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal"
  }
  ```
  *(Ou para a Rafaela Marques: `{"cliente": "Rafaela Marques", "tipo": "retirada", "valor": 450, "prioridade": "alta"}`)*
- **Status HTTP Esperado:** `201 Created`
- **Resposta Esperada:**
  ```json
  {
    "id": 1,
    "cliente": "Pedro Akylas",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal",
    "status": "recebido"
  }
  ```
- **Aba Tests:** Exibe `PASS [Pedro] Status code é 201 Created` e `PASS [Pedro] Pedido cadastrado com cliente 'Pedro Akylas'`.

---

### 2. `02-validacao.png`
- **Cenário:** Falha de Validação ao tentar cadastrar pedido inválido (cliente com espaços vazios ou ausente).
- **Método:** `POST`
- **URL:** `http://localhost:3000/pedidos`
- **Headers:** `Content-Type: application/json`
- **Corpo da Requisição (Body raw JSON):**
  ```json
  {
    "cliente": "   ",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal"
  }
  ```
- **Status HTTP Esperado:** `400 Bad Request`
- **Resposta Esperada:**
  ```json
  {
    "erro": "O campo 'cliente' é obrigatório e não pode ser vazio"
  }
  ```

---

### 3. `03-listagem.png`
- **Cenário:** Listagem de Pedidos Cadastrados (mostrando os pedidos do Pedro e da Rafaela).
- **Método:** `GET`
- **URL:** `http://localhost:3000/pedidos`
- **Corpo:** Vazio.
- **Status HTTP Esperado:** `200 OK`
- **Resposta Esperada:**
  ```json
  [
    {
      "id": 1,
      "cliente": "Pedro Akylas",
      "tipo": "entrega",
      "valor": 350,
      "prioridade": "normal",
      "status": "recebido"
    },
    {
      "id": 2,
      "cliente": "Rafaela Marques",
      "tipo": "retirada",
      "valor": 450,
      "prioridade": "alta",
      "status": "recebido"
    }
  ]
  ```

---

### 4. `04-consulta-inexistente.png`
- **Cenário:** Consulta de Pedido por ID Inexistente.
- **Método:** `GET`
- **URL:** `http://localhost:3000/pedidos/999`
- **Corpo:** Vazio.
- **Status HTTP Esperado:** `404 Not Found`
- **Resposta Esperada:**
  ```json
  {
    "erro": "Pedido com ID 999 não encontrado"
  }
  ```

---

### 5. `05-atualizacao.png`
- **Cenário:** Atualização válida do status do pedido (de `recebido` para `em_preparacao`).
- **Método:** `PATCH`
- **URL:** `http://localhost:3000/pedidos/1/status`
- **Headers:** `Content-Type: application/json`
- **Corpo da Requisição (Body raw JSON):**
  ```json
  {
    "status": "em_preparacao"
  }
  ```
- **Status HTTP Esperado:** `200 OK`
- **Resposta Esperada:**
  ```json
  {
    "id": 1,
    "cliente": "Pedro Akylas",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal",
    "status": "em_preparacao"
  }
  ```

---

## Nomes dos Arquivos de Imagem
Salve as imagens exatamente nesta pasta com os nomes:
1. `01-criacao.png`
2. `02-validacao.png`
3. `03-listagem.png`
4. `04-consulta-inexistente.png`
5. `05-atualizacao.png`
