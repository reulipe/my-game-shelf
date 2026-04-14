import { Router } from 'express';
import { criarJogo, listarJogos } from '../store/jogosStore.js';
import { validateCadastroJogo } from '../validation/validateCadastroJogo.js';

/**
 * @openapi
 * /jogos:
 *   get:
 *     tags:
 *       - Jogos
 *     summary: Listar todos os jogos
 *     description: Retorna a lista completa de jogos cadastrados em memória.
 *     responses:
 *       '200':
 *         description: Lista obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Jogo'
 *   post:
 *     tags:
 *       - Jogos
 *     summary: Cadastrar um jogo
 *     description: |
 *       Cria um novo jogo na estante. O `id` é gerado automaticamente e não deve ser enviado.
 *       Em caso de erro de validação, a API responde com HTTP 422 e uma lista de erros.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JogoCadastroRequest'
 *           examples:
 *             digital:
 *               summary: Jogo digital
 *               value:
 *                 titulo: The Witcher 3
 *                 plataforma: PS5
 *                 tipoMidia: digital
 *                 status: jogando
 *                 notaPessoal: 9.5
 *                 horasJogadas: 42
 *                 dataCompra: '2026-04-14'
 *                 precoPago: 79.9
 *                 moeda: BRL
 *                 detalhesMidia:
 *                   lojaDigital: PSN
 *                   licencaTipo: compra
 *                   statusLicenca: ativa
 *             fisica:
 *               summary: Jogo físico
 *               value:
 *                 titulo: God of War Ragnarok
 *                 plataforma: PS5
 *                 tipoMidia: fisica
 *                 status: nao_iniciado
 *                 precoPago: 249.9
 *                 moeda: BRL
 *                 detalhesMidia:
 *                   formatoFisico: disco
 *                   estadoMidia: novo
 *                   regiao: ALL
 *     responses:
 *       '201':
 *         description: Jogo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Jogo'
 *       '422':
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
export const jogosRouter = Router();

jogosRouter.get('/', (_req, res) => {
  res.json({ data: listarJogos() });
});

jogosRouter.post('/', (req, res) => {
  const errors = validateCadastroJogo(req.body);
  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  const {
    titulo,
    plataforma,
    tipoMidia,
    status,
    notaPessoal,
    horasJogadas,
    dataCompra,
    precoPago,
    moeda,
    detalhesMidia,
  } = req.body;

  const jogo = criarJogo({
    titulo,
    plataforma,
    tipoMidia,
    status,
    ...(notaPessoal !== undefined ? { notaPessoal } : {}),
    ...(horasJogadas !== undefined ? { horasJogadas } : {}),
    ...(dataCompra !== undefined && dataCompra !== '' ? { dataCompra } : {}),
    precoPago,
    ...(moeda !== undefined ? { moeda } : {}),
    detalhesMidia,
  });

  return res.status(201).json({ data: jogo });
});
