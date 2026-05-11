import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';

export class ReservaNaoEncontradaError extends Error {
  constructor() {
    super('Reserva não encontrada');
  }
}

export class PresencaInvalidaError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

const confirmarPresenca = new Elysia()
  .use(auth)
  .use(prisma)
  .error({
    RESERVA_NAO_ENCONTRADA: ReservaNaoEncontradaError,
    PRESENCA_INVALIDA: PresencaInvalidaError,
  })
  .onError(({ code, error, set }) => {
    if (code === 'RESERVA_NAO_ENCONTRADA') {
      set.status = 404;
      return { ok: false, error: error.message };
    }
    if (code === 'PRESENCA_INVALIDA') {
      set.status = 422;
      return { ok: false, error: error.message };
    }
  })
  .post(
    '/:id/confirmar-presenca',
    async ({ requireFuncionario, prisma, params }) => {
      await requireFuncionario();

      const reserva = await prisma.reserva.findUnique({ where: { id: params.id } });
      if (!reserva) throw new ReservaNaoEncontradaError();

      if (reserva.statusPagamento !== 'PAGO') {
        throw new PresencaInvalidaError('Apenas reservas pagas podem ter presença confirmada');
      }

      if (reserva.presencaConfirmada) {
        throw new PresencaInvalidaError('Presença já confirmada');
      }

      const agora = new Date();
      const dezMinutosAposInicio = new Date(reserva.horarioInicio.getTime() + 10 * 60000);

      if (agora > dezMinutosAposInicio) {
        throw new PresencaInvalidaError('Prazo de confirmação de presença expirado (RN4)');
      }

      const reservaAtualizada = await prisma.reserva.update({
        where: { id: params.id },
        data: { presencaConfirmada: true },
      });

      // Atualiza status da mesa para RESERVADA
      await prisma.mesa.update({
        where: { id: reserva.mesaId },
        data: { status: 'RESERVADA' },
      });

      return { ok: true, data: reservaAtualizada };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ['Reservas'] },
    },
  );

export default confirmarPresenca;
