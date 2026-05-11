// routes/reservas/cancelarReserva.ts
import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';

export class ReservaNaoEncontradaError extends Error {
  constructor() {
    super('Reserva não encontrada');
  }
}

export class CancelamentoNaoPermitidoError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

const cancelarReserva = new Elysia()
  .use(auth)
  .use(prisma)
  .error({
    RESERVA_NAO_ENCONTRADA: ReservaNaoEncontradaError,
    CANCELAMENTO_NAO_PERMITIDO: CancelamentoNaoPermitidoError,
  })
  .onError(({ code, error, set }) => {
    if (code === 'RESERVA_NAO_ENCONTRADA') {
      set.status = 404;
      return { ok: false, error: error.message };
    }
    if (code === 'CANCELAMENTO_NAO_PERMITIDO') {
      set.status = 422;
      return { ok: false, error: error.message };
    }
  })
  .patch(
    '/:id/cancelar',
    async ({ getUserId, prisma, params }) => {
      const usuarioId = await getUserId();

      const reserva = await prisma.reserva.findUnique({ where: { id: params.id } });
      if (!reserva || reserva.usuarioId !== usuarioId) throw new ReservaNaoEncontradaError();

      const agora = new Date();

      // RE6.1: não pode cancelar reserva que já iniciou ou passou
      if (reserva.horarioInicio <= agora) {
        throw new CancelamentoNaoPermitidoError(
          'Não é possível cancelar uma reserva que já iniciou ou passou (RE6.1)',
        );
      }

      // RN4: reembolso apenas com 24h de antecedência
      const horasAteInicio = (reserva.horarioInicio.getTime() - agora.getTime()) / (1000 * 60 * 60);
      const elegívelReembolso = horasAteInicio >= 24;

      const reservaCancelada = await prisma.reserva.update({
        where: { id: params.id },
        data: { statusPagamento: 'CANCELADO' },
      });

      return {
        ok: true,
        data: {
          reserva: reservaCancelada,
          reembolso: elegívelReembolso,
          mensagem: elegívelReembolso
            ? 'Reserva cancelada. Reembolso será processado.'
            : 'Reserva cancelada sem direito a reembolso (menos de 24h de antecedência).',
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ['Reservas'] },
    },
  );

export default cancelarReserva;
