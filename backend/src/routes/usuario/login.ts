import { Elysia, t } from 'elysia';
import auth, { UnauthorizedError } from '../../auth';
import prisma from '../../db';
import { checkRateLimit } from '../../lib/rateLimit';

const login = new Elysia()
  .use(auth)
  .use(prisma)
  .post(
    '/login',
    async ({ request, set, prisma, body, jwt }) => {
      const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
      if (checkRateLimit(ip, 10, 60000)) {
        set.status = 429;
        return { ok: false, error: 'Muitas tentativas. Tente novamente em 1 minuto.' };
      }

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
