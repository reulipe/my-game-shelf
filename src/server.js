import { createApp } from './app.js';

const port = Number(process.env.PORT) || 5622;

const app = createApp();

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
