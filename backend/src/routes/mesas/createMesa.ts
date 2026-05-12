import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';

const createMesa = new Elysia()
  .use(auth)
  .use(prisma)
  .post(
    '/',
    async ({ requireFuncionario, prisma, body, set }) => {
      await requireFuncionario();

      const mesaExiste = await prisma.mesa.findUnique({
        where: { numero: body.numero },
      });

      if (mesaExiste) {
        set.status = 409;
        return { ok: false, error: 'Já existe uma mesa com este número' };
      }

      const mesa = await prisma.mesa.create({
        data: {
          numero: body.numero,
          status: 'DISPONIVEL',
        },
      });

      return { ok: true, data: mesa };
    },
    {
      body: t.Object({ numero: t.Number() }, { error: 'É necessário informar o número da mesa' }),
      detail: { tags: ['Mesas'] },
    },
  );

export default createMesa;
