import cors from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { iniciarJobs } from './jobs/reservaJobs';
import { UnauthorizedError } from './lib/auth';
import mesasGroup from './routes/mesas';
import reservaGroup from './routes/reservas';
import usuariosGroup from './routes/usuario';

const PORT = Number(process.env.PORT) || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:1420'];

const app = new Elysia()
  .error({ UNAUTHORIZED: UnauthorizedError })
  .onError(({ code, error, set }) => {
    if (code === 'UNAUTHORIZED') set.status = 401;
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  })
  .get('/health', () => ({ status: 'ok' }))
  .group('/api', (app) =>
    app
      .use(
        cors({
          methods: ['DELETE', 'GET', 'PATCH', 'POST', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Access-Control-Allow-Origin',
            'Origin',
          ],
          origin: allowedOrigins,
        }),
      )
      .use(usuariosGroup)
      .use(mesasGroup)
      .use(reservaGroup),
  )
  .listen(PORT);

iniciarJobs();

console.log(`🦊 Backend rodando em ${app.server?.hostname}:${app.server?.port}`);

export default app;
