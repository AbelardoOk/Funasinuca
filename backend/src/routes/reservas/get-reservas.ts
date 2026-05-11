import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';
import { StatusPagamentoSchema } from '../../lib/schemas';

const getReservas = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/',
    async ({ requireFuncionario, prisma, query }) => {
      await requireFuncionario();

      const reservas = await prisma.reserva.findMany({
        where: {
          ...(query.mesaId && { mesaId: query.mesaId }),
          ...(query.status && { statusPagamento: query.status }),
          ...(query.data && {
            horarioInicio: {
              gte: new Date(query.data),
              lt: new Date(new Date(query.data).getTime() + 24 * 60 * 60000),
            },
          }),
        },
        include: { mesa: true, usuario: { select: { id: true, nome: true, email: true } } },
        orderBy: { horarioInicio: 'asc' },
      });

      return { ok: true, data: reservas };
    },
    {
      query: t.Object({
        mesaId: t.Optional(t.String()),
        status: t.Optional(StatusPagamentoSchema),
        data: t.Optional(t.String()),
      }),
      detail: { tags: ['Reservas'] },
    },
  );

export default getReservas;
