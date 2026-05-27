import cors from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { UnauthorizedError } from './lib/auth';
import mesasGroup from './routes/mesas';
import reservaGroup from './routes/reservas';
import usuariosGroup from './routes/usuario';

const app = new Elysia()
  .error({ UNAUTHORIZED: UnauthorizedError })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401;
    }

    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  })

  .get('/health', () => ({ status: 'ok' }))

  .group('/api', (app) =>
    app
      .use(
        cors({
          // Configurado para aceitar qualquer origem
          methods: ['DELETE', 'GET', 'PATCH', 'POST', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Access-Control-Allow-Origin',
            'Origin',
          ],
          origin: ['http://localhost:3001', 'http://localhost:3002'],
        }),
      )
      .use(usuariosGroup)
      .use(mesasGroup)
      .use(reservaGroup),
  )

  .listen(3000);

// Abaixo está a tarefa que realiza a cada minuto verificando as reservas
// iniciarJobs();

// no index.ts, antes do .listen()
// console.log(app.routes.map((r) => `${r.method} ${r.path}`));
console.log(`🦊 Backend rodando em ${app.server?.hostname}:${app.server?.port}`);

export default app;
