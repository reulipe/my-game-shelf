import swaggerJsdoc from 'swagger-jsdoc';

const port = Number(process.env.PORT) || 5622;

/** @type {import('swagger-jsdoc').Options} */
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'My Game Shelf API',
      version: '1.0.0',
      description:
        'API para simular uma estante de jogos: cadastro (POST /jogos) e listagem (GET /jogos). Os dados são mantidos em memória.',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor local (porta padrão 5622)',
      },
    ],
    tags: [{ name: 'Jogos', description: 'Operações sobre jogos da estante' }],
    components: {
      schemas: {
        DetalhesMidiaDigital: {
          type: 'object',
          required: ['lojaDigital', 'licencaTipo', 'statusLicenca'],
          properties: {
            lojaDigital: {
              type: 'string',
              example: 'PSN',
              description: 'Loja digital (ex.: Steam, PSN, eShop).',
            },
            licencaTipo: {
              type: 'string',
              enum: ['compra', 'assinatura', 'resgate_codigo'],
            },
            statusLicenca: {
              type: 'string',
              enum: ['ativa', 'expirada', 'removida'],
            },
          },
        },
        DetalhesMidiaFisica: {
          type: 'object',
          required: ['formatoFisico', 'estadoMidia', 'regiao'],
          properties: {
            formatoFisico: {
              type: 'string',
              enum: ['disco', 'cartucho', 'colecionador'],
            },
            estadoMidia: {
              type: 'string',
              enum: ['novo', 'semi_novo', 'usado'],
            },
            regiao: { type: 'string', example: 'R1' },
          },
        },
        JogoCadastroRequest: {
          type: 'object',
          required: [
            'titulo',
            'plataforma',
            'tipoMidia',
            'status',
            'precoPago',
            'detalhesMidia',
          ],
          properties: {
            titulo: { type: 'string' },
            plataforma: { type: 'string' },
            tipoMidia: { type: 'string', enum: ['fisica', 'digital'] },
            status: {
              type: 'string',
              enum: ['nao_iniciado', 'jogando', 'zerado'],
            },
            notaPessoal: {
              oneOf: [{ type: 'number', minimum: 0, maximum: 10 }, { type: 'null' }],
              description: 'Opcional. Entre 0 e 10, ou null.',
            },
            horasJogadas: { type: 'number', minimum: 0 },
            dataCompra: {
              type: 'string',
              format: 'date',
              example: '2026-04-14',
            },
            precoPago: { type: 'number', minimum: 0 },
            moeda: { type: 'string', example: 'BRL' },
            detalhesMidia: {
              oneOf: [
                { $ref: '#/components/schemas/DetalhesMidiaDigital' },
                { $ref: '#/components/schemas/DetalhesMidiaFisica' },
              ],
              description:
                'Deve ser compatível com tipoMidia (digital ou fisica). Campos cruzados não são permitidos.',
            },
          },
        },
        Jogo: {
          allOf: [
            {
              type: 'object',
              required: ['id'],
              properties: {
                id: {
                  type: 'integer',
                  description: 'Identificador numérico gerado pelo servidor.',
                  example: 1,
                },
              },
            },
            { $ref: '#/components/schemas/JogoCadastroRequest' },
          ],
        },
        ValidationErrorItem: {
          type: 'object',
          required: ['field', 'code', 'message'],
          properties: {
            field: { type: 'string', example: 'precoPago' },
            code: { type: 'string', example: 'MIN_VALUE' },
            message: { type: 'string' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          required: ['errors'],
          properties: {
            errors: {
              type: 'array',
              items: { $ref: '#/components/schemas/ValidationErrorItem' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/jogosRoutes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
