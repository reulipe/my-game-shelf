# My Game Shelf API

## Descrição

API REST em **JavaScript** com **Express** que simula uma **estante de jogos**. Permite **cadastrar** jogos (mídia física ou digital) e **listar** todos os registros. Os dados ficam **somente em memória**: ao reiniciar o servidor, a lista volta vazia.

Documentação interativa disponível em **Swagger UI** (`/api-docs`).

## Tecnologias utilizadas

- **Node.js** (recomendado **18+**, suporte a ES Modules e `node --watch`)
- **Express** — servidor HTTP e roteamento
- **swagger-jsdoc** — geração da especificação **OpenAPI 3**
- **swagger-ui-express** — interface Swagger no navegador

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

Detalhes dos campos de `detalhesMidia` e códigos de erro estão descritos no **Swagger** e implementados em `src/validation/validateCadastroJogo.js`.

### Exemplos rápidos (curl)

Cadastro (digital):

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

Listagem:

```bash
curl http://localhost:5622/jogos
```

## Estrutura de arquivos

```
my-game-shelf/
├── package.json
├── .gitignore
├── README.md
└── src/
    ├── server.js              # Entrada: sobe o HTTP na porta (padrão 5622)
    ├── app.js                 # Configura Express, rotas e Swagger UI
    ├── types.js               # Tipos JSDoc (referência)
    ├── config/
    │   └── swagger.js         # OpenAPI: info, schemas, geração com swagger-jsdoc
    ├── routes/
    │   └── jogosRoutes.js     # GET/POST /jogos + anotações @openapi
    ├── store/
    │   └── jogosStore.js      # Persistência em memória + auto incremento do id
    └── validation/
        └── validateCadastroJogo.js  # Validações do cadastro (422)
```

## Autor

**Reulipe** — repositório: [reulipe/my-game-shelf](https://github.com/reulipe/my-game-shelf)
