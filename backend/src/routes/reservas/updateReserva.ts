import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';
import { StatusPagamentoSchema } from '../../lib/schemas';

const updateReserva = new Elysia()
  .use(auth)
  .use(prisma)
  .patch(
    '/:id',
    async ({ getUserId, requireFuncionario, prisma, params, body, set }) => {
      const usuarioId = await getUserId();

      const reserva = await prisma.reserva.findUnique({ where: { id: params.id } });
      if (!reserva) {
        set.status = 404;
        return { ok: false, error: 'Reserva não encontrada' };
      }

      const isDono = reserva.usuarioId === usuarioId;
      let isFuncionario = false;

      if (!isDono) {
        await requireFuncionario();
        isFuncionario = true;
      }

      const dadosAtualizacao: any = {
        ...(body.mesaId && { mesaId: body.mesaId }),
        ...(body.horarioInicio && {
          horarioInicio: new Date(body.horarioInicio),
          horarioFim: new Date(new Date(body.horarioInicio).getTime() + 30 * 60000),
        }),
      };

      if (isFuncionario) {
        if (body.status) dadosAtualizacao.statusPagamento = body.status;
        if (body.gatewayTransacaoId) dadosAtualizacao.gatewayTransacaoId = body.gatewayTransacaoId;
      }

      const reservaAtualizada = await prisma.reserva.update({
        where: { id: params.id },
        data: dadosAtualizacao,
      });

      return { ok: true, data: reservaAtualizada };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Optional(StatusPagamentoSchema),
        gatewayTransacaoId: t.Optional(t.String()),
        horarioInicio: t.Optional(t.String()),
        mesaId: t.Optional(t.String()),
      }),
      detail: { tags: ['Reservas'] },
    },
  );

export default updateReserva;
