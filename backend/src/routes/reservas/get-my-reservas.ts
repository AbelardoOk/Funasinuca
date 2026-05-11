// routes/reservas/getMinhasReservas.ts
import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';
import { StatusPagamentoSchema } from '../../lib/schemas';

const getMinhasReservas = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/minhas',
    async ({ getUserId, prisma, query }) => {
      const usuarioId = await getUserId();

      const reservas = await prisma.reserva.findMany({
        where: {
          usuarioId,
          ...(query.status && { statusPagamento: query.status }),
        },
        include: { mesa: true },
        orderBy: { horarioInicio: 'desc' },
      });

      return { ok: true, data: reservas };
    },
    {
      query: t.Object({
        status: t.Optional(StatusPagamentoSchema),
      }),
      detail: { tags: ['Reservas'] },
    },
  );

export default getMinhasReservas;
