import { password } from 'bun';
import { Elysia, t } from 'elysia';
import { Prisma } from '../../../prisma/generated/client/client';
import { TipoUsuario } from '../../../prisma/prismabox/TipoUsuario';
import auth from '../../auth';
import prisma from '../../db';

export class EmailEmUsoError extends Error {
  constructor() {
    super('Este email já está em uso');
  }
}

export class CpfInvalido extends Error {
  constructor() {
    super('O CPF é inválido');
  }
}

const register = new Elysia()
  .use(auth)
  .use(prisma)
  .error({ EMAIL_EM_USO: EmailEmUsoError, CPF_INVALIDO: CpfInvalido })
  .onError(({ code, error, set }) => {
    if (code === 'EMAIL_EM_USO') {
      set.status = 409;
      return { ok: false, error: error.message };
    }
    if (code === 'CPF_INVALIDO') {
      set.status = 400;
      return { ok: false, error: error.message };
    }
  })
  .post(
    '/register',
    async ({ prisma, body, jwt }) => {
      const senha = await password.hash(body.senha, 'bcrypt');

      if (body.cpf.length != 11) {
        throw new CpfInvalido();
      }

      const data = {
        nome: body.nome,
        cpf: body.cpf,
        email: body.email,
        senha: senha,
        tipo: TipoUsuario.CLIENTE,
      };

      const user = await prisma.usuario
        .create({
          data,
        })
        .catch((e) => {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            const campo = (e.meta?.target as string[])?.join(', ');
            if (campo?.includes('cpf')) throw new CpfInvalido();
            throw new EmailEmUsoError();
          }
          throw e;
        });

      return {
        ok: true,
        data: {
          token: await jwt.sign({ userId: user.id }),
          userName: user.nome,
          cpf: user.cpf,
        },
      };
    },
    {
      body: t.Object(
        { nome: t.String(), cpf: t.String(), email: t.String(), senha: t.String() },
        { error: 'A requisição precisa apenas de nome, cpf, email e senha' },
      ),
      detail: { tags: ['Auth'] },
    },
  );

export default register;
