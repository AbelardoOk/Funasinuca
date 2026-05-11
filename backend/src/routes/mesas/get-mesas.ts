import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';

const getMesas = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/',
    async ({ requireFuncionario, prisma, query }) => {
      await requireFuncionario();

      const mesas = await prisma.mesa.findMany({
        where: {
          ...(query.status && { status: query.status }),
          ...(query.ativa !== undefined && { ativa: query.ativa === 'true' }),
          ...(query.numero && { numero: Number(query.numero) }),
        },
        orderBy: { numero: 'asc' },
      });

      return { ok: true, data: mesas };
    },
    {
      query: t.Object({
        status: t.Optional(
          t.Union([
            t.Literal('DISPONIVEL'),
            t.Literal('RESERVADA'),
            t.Literal('INDISPONIVEL'),
            t.Literal('ATRASADA'),
          ]),
        ),
        ativa: t.Optional(t.String()),
        numero: t.Optional(t.String()),
      }),
      detail: { tags: ['Mesas'] },
    },
  );

export default getMesas;
