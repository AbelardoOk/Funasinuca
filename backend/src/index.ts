import cors from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { UnauthorizedError } from './auth';
import mesasGroup from './routes/mesas';
import login from './routes/usuario/login';
import register from './routes/usuario/register';

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
        }),
      )
      .use(login)
      .use(register)
      .use(mesasGroup),
  )

  .listen(3000);

// no index.ts, antes do .listen()
// console.log(app.routes.map((r) => `${r.method} ${r.path}`));
console.log(`🦊 Backend rodando em ${app.server?.hostname}:${app.server?.port}`);
