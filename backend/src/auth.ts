import { bearer } from '@elysiajs/bearer';
import { jwt } from '@elysiajs/jwt';
import { Elysia, t } from 'elysia';
import { TipoUsuario } from '../prisma/prismabox/TipoUsuario';
import { Usuario } from '../prisma/prismabox/Usuario';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

const auth = new Elysia({ name: 'auth' })
  .use(bearer())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET_KEY ?? '',
      schema: t.Object({
        userId: t.String({ format: 'uuid', error: 'Id precisa ser um UUID' }),
      }),
    }),
  )
  .derive(({ bearer, jwt }) => {
    const getAuthenticatedUser = async () => {
      const session = await jwt.verify(bearer);
      if (!session || typeof session.userId !== 'string') {
        throw new UnauthorizedError();
      }

      const user = await Usuario.findUnique({
        where: { id: session.userId },
      });

      if (!user) throw new UnauthorizedError();
      return user;
    };

    return {
      getUserId: async () => {
        const user = await getAuthenticatedUser();
        return user.id;
      },

      signJwt: async (userId: string) => {
        return await jwt.sign({ userId });
      },

      requireAdmin: async () => {
        const user = await getAuthenticatedUser();
        if (user.tipo !== TipoUsuario.ADMINISTRADOR) {
          throw new UnauthorizedError('Acesso restrito a administradores');
        }
        return user;
      },

      requireFuncionario: async () => {
        const user = await getAuthenticatedUser();
        const allowed = [TipoUsuario.FUNCIONARIO, TipoUsuario.ADMINISTRADOR];
        if (!allowed.includes(user.tipo)) {
          throw new UnauthorizedError('Acesso restrito a funcionários');
        }
        return user;
      },
    };
  });

export default auth;
