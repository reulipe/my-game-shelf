# My Game Shelf API

## Descrição

API REST em **JavaScript** com **Express** que simula uma **estante de jogos**. Permite **cadastrar** jogos (mídia física ou digital) e **listar** todos os registros. Os dados ficam **somente em memória**: ao reiniciar o servidor, a lista volta vazia.

- **Documentação interativa:** **Swagger UI** em `/api-docs` (especificação gerada a partir do código com **swagger-jsdoc**).
- **Contrato em arquivo:** **`openapi.yaml`** na raiz do projeto descreve os endpoints (referência única para integração e para os testes funcionais).

## Tecnologias utilizadas

### Aplicação

- **Node.js** (recomendado **18+**, ES Modules e `node --watch`)
- **Express** — servidor HTTP e roteamento
- **swagger-jsdoc** — montagem da especificação **OpenAPI 3** usada pelo Swagger UI
- **swagger-ui-express** — interface Swagger no navegador

### Testes e relatórios

- **Mocha** — execução dos testes
- **Supertest** — chamadas HTTP à API em memória
- **Chai** — asserções
- **Mochawesome** — relatório em **JSON** e **HTML** após `npm test`

## Instalação e configuração

### Pré-requisitos

- Node.js instalado (versão 18 ou superior).

### Instalação

Na raiz do projeto:

```bash
npm install
```

### Execução

**Porta padrão: `5622`.**

```bash
npm start
```

Para recarregar automaticamente ao editar arquivos (Node 18+):

```bash
npm run dev
```

Variável de ambiente opcional:

- **`PORT`** — altera a porta (padrão `5622`). Ex.: `PORT=3000 npm start`

Após subir o servidor:

- API base: `http://localhost:5622`
- Swagger: `http://localhost:5622/api-docs`
- Verificação simples: `GET http://localhost:5622/health`

### Testes

| Comando | Descrição |
|---------|-----------|
| `npm test` | Roda todos os testes (`test/**/*.test.js`) com reporter **mochawesome** e gera relatório em `mochawesome-report/` (`mochawesome.html` e `mochawesome.json`). |
| `npm run test:spec` | Mesmos testes com saída **spec** no terminal (útil para depuração rápida sem focar no relatório HTML). |

A pasta **`mochawesome-report/`** é ignorada pelo Git (`.gitignore`) por ser artefato gerado.

Os testes funcionais do **POST `/jogos`** usam **fixtures** em `test/jogos/fixtures/` e resetam o armazenamento em memória entre casos (`resetJogosStore` em `src/store/jogosStore.js`).

## Funcionalidades

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/jogos` | Cadastro de jogo. Gera `id` numérico sequencial. Validações retornam **422** com lista `{ field, code, message }`. |
| `GET` | `/jogos` | Lista todos os jogos cadastrados em memória. |
| `GET` | `/health` | Retorna `{ "ok": true }` (apoio a monitoramento; não faz parte do escopo principal da estante). |

### Regras de negócio (cadastro)

- **`id`**: não pode ser enviado no cadastro; gerado pelo servidor.
- **`precoPago`**: obrigatório, número **`>= 0`**.
- **`status`**: enum fechado — `nao_iniciado`, `jogando`, `zerado`.
- **`tipoMidia`**: `fisica` ou `digital`; **`detalhesMidia`** deve conter **apenas** os campos do tipo escolhido.
- **`notaPessoal`**: opcional; se informada, deve ser número entre **0 e 10** (ou `null`).

Detalhes dos campos de `detalhesMidia` e códigos de erro estão em **`openapi.yaml`**, no **Swagger** (`/api-docs`) e na implementação em `src/validation/validateCadastroJogo.js`.

### Exemplos rápidos

#### Cadastro (digital) — `curl`

```bash
curl -X POST http://localhost:5622/jogos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "The Witcher 3",
    "plataforma": "PS5",
    "tipoMidia": "digital",
    "status": "jogando",
    "precoPago": 79.9,
    "moeda": "BRL",
    "detalhesMidia": {
      "lojaDigital": "PSN",
      "licencaTipo": "compra",
      "statusLicenca": "ativa"
    }
  }'
```

#### Cadastro (digital) — Postman

- Method: `POST`
- URL: `http://localhost:5622/jogos`
- Headers: `Content-Type: application/json`
- Body (raw / JSON):

```json
{
  "titulo": "The Witcher 3",
  "plataforma": "PS5",
  "tipoMidia": "digital",
  "status": "jogando",
  "precoPago": 79.9,
  "moeda": "BRL",
  "detalhesMidia": {
    "lojaDigital": "PSN",
    "licencaTipo": "compra",
    "statusLicenca": "ativa"
  }
}
```

#### Listagem — `curl`

```bash
curl http://localhost:5622/jogos
```

#### Listagem — Postman

- Method: `GET`
- URL: `http://localhost:5622/jogos`
- Body: nenhum

## Estrutura de arquivos

```
my-game-shelf/
├── openapi.yaml               # Especificação OpenAPI 3 (contrato da API)
├── package.json
├── .gitignore
├── README.md
├── src/
│   ├── server.js              # Entrada: sobe o HTTP na porta (padrão 5622)
│   ├── app.js                 # Configura Express, rotas e Swagger UI
│   ├── types.js               # Tipos JSDoc (referência)
│   ├── config/
│   │   └── swagger.js         # OpenAPI para swagger-jsdoc + UI
│   ├── routes/
│   │   └── jogosRoutes.js     # GET/POST /jogos + anotações @openapi
│   ├── store/
│   │   └── jogosStore.js      # Memória, auto incremento do id, reset para testes
│   └── validation/
│       └── validateCadastroJogo.js
└── test/
    └── jogos/                 # Testes do endpoint /jogos
        ├── post.test.js       # Testes funcionais do POST /jogos
        └── fixtures/          # Payloads JSON isolados por caso
```

## Autor

**Reulipe** — repositório: [https://github.com/reulipe/my-game-shelf](https://github.com/reulipe/my-game-shelf)
