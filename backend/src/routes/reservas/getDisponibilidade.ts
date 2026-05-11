import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';

const getDisponibilidade = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/disponibilidade',
    async ({ getUserId, prisma, query }) => {
      await getUserId(); // qualquer usuário autenticado pode consultar

      const horarioInicio = new Date(query.horarioInicio);
      const horarioFim = new Date(horarioInicio.getTime() + 30 * 60000);

      // Busca todas as mesas ativas
      const todasMesas = await prisma.mesa.findMany({
        where: { ativa: true },
        orderBy: { numero: 'asc' },
      });

      // Busca mesas com conflito no horário solicitado
      const mesasOcupadas = await prisma.reserva.findMany({
        where: {
          statusPagamento: { not: 'CANCELADO' },
          OR: [{ horarioInicio: { lt: horarioFim }, horarioFim: { gt: horarioInicio } }],
        },
        select: { mesaId: true },
      });

      const idsOcupadas = new Set(mesasOcupadas.map((r) => r.mesaId));

      const mesas = todasMesas.map((mesa) => ({
        ...mesa,
        disponivel: !idsOcupadas.has(mesa.id),
      }));

      return { ok: true, data: mesas };
    },
    {
      query: t.Object({
        horarioInicio: t.String({ description: 'ISO 8601 — ex: 2026-05-10T20:00:00' }),
      }),
      detail: { tags: ['Reservas'] },
    },
  );

export default getDisponibilidade;
