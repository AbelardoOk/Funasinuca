import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';

const getRelatorio = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/relatorio',
    async ({ requireAdmin, prisma, query }) => {
      await requireAdmin();

      const dataInicio = new Date(query.dataInicio);
      const dataFim = new Date(query.dataFim);

      const reservas = await prisma.reserva.findMany({
        where: {
          horarioInicio: { gte: dataInicio, lte: dataFim },
        },
        include: {
          mesa: { select: { numero: true } },
          usuario: { select: { nome: true, email: true } },
        },
      });

      // Agrupamentos
      const total = reservas.length;
      const pagas = reservas.filter((r) => r.statusPagamento === 'PAGO').length;
      const canceladas = reservas.filter((r) => r.statusPagamento === 'CANCELADO').length;
      const pendentes = reservas.filter((r) => r.statusPagamento === 'PENDENTE').length;

      // Uso por mesa
      const usoPorMesa = reservas.reduce<Record<number, number>>((acc, r) => {
        const num = r.mesa.numero;
        acc[num] = (acc[num] ?? 0) + 1;
        return acc;
      }, {});

      // Reservas por dia
      const porDia = reservas.reduce<Record<string, number>>((acc, r) => {
        const dia = r.horarioInicio.toISOString().split('T')[0];
        acc[dia] = (acc[dia] ?? 0) + 1;
        return acc;
      }, {});

      return {
        ok: true,
        data: {
          periodo: { dataInicio, dataFim },
          totais: { total, pagas, canceladas, pendentes },
          usoPorMesa,
          porDia,
          reservas,
        },
      };
    },
    {
      query: t.Object({
        dataInicio: t.String({ description: 'ISO 8601 — ex: 2026-05-01' }),
        dataFim: t.String({ description: 'ISO 8601 — ex: 2026-05-31' }),
      }),
      detail: { tags: ['Relatórios'] },
    },
  );

export default getRelatorio;
