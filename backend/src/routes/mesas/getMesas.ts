import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';
import { StatusMesaSchema } from '../../lib/schemas';

const getMesas = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/',
    async ({ prisma, query }) => {
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
        status: t.Optional(StatusMesaSchema),
        ativa: t.Optional(t.String()),
        numero: t.Optional(t.String()),
      }),
      detail: { tags: ['Mesas'] },
    },
  );

export default getMesas;
