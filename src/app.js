import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { jogosRouter } from './routes/jogosRoutes.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/jogos', jogosRouter);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((_req, res) => {
    res.status(404).json({ message: 'Rota não encontrada.' });
  });

  return app;
}
