import { Elysia, t } from 'elysia';
import { rateLimit } from 'elysia-rate-limit';
import auth, { UnauthorizedError } from '../../auth';
import prisma from '../../db';

const login = new Elysia()
  .use(auth)
  .use(prisma)
  .use(rateLimit({ duration: 60000, max: 10 }))
  .post(
    '/login',
    async ({ prisma, body, jwt }) => {
      const user = await prisma.usuario.findUnique({
        where: { email: body.email },
      });
      if (!user) throw new UnauthorizedError();

      if (await !Bun.password.verifySync(body.senha, user.senha, 'bcrypt')) {
        throw new UnauthorizedError();
      }

      return {
        ok: true,
        data: {
          token: await jwt.sign({ userId: user.id }),
          userRole: user.tipo,
        },
      };
    },
    {
      body: t.Object(
        { email: t.String(), senha: t.String() },
        { error: 'A requisição precisa apenas de email e senha' },
      ),
      detail: { tags: ['Auth'] },
    },
  );

export default login;
