import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import { DURACAO_RESERVA_MS } from '../../lib/constants';
import prisma from '../../lib/db';

export class MesaIndisponivelError extends Error {
  constructor() {
    super('Mesa indisponível no horário solicitado');
  }
}

export class HorarioConsecutivoError extends Error {
  constructor() {
    super('Não é permitido reservar horários consecutivos na mesma mesa (RN1)');
  }
}

const createReserva = new Elysia()
  .use(auth)
  .use(prisma)
  .error({
    MESA_INDISPONIVEL: MesaIndisponivelError,
    HORARIO_CONSECUTIVO: HorarioConsecutivoError,
  })
  .onError(({ code, error, set }) => {
    if (code === 'MESA_INDISPONIVEL') {
      set.status = 409;
      return { ok: false, error: error.message };
    }
    if (code === 'HORARIO_CONSECUTIVO') {
      set.status = 409;
      return { ok: false, error: error.message };
    }
  })
  .post(
    '/',
    async ({ getUserId, prisma, body }) => {
      const usuarioId = await getUserId();

      const horarioInicio = new Date(body.horarioInicio);
      const horarioFim = new Date(horarioInicio.getTime() + DURACAO_RESERVA_MS); // RN1: sempre +30min

      // Verifica se mesa está disponível no horário (RE7.1)
      const conflito = await prisma.reserva.findFirst({
        where: {
          mesaId: body.mesaId,
          statusPagamento: { not: 'CANCELADO' },
          OR: [{ horarioInicio: { lt: horarioFim }, horarioFim: { gt: horarioInicio } }],
        },
      });
      if (conflito) throw new MesaIndisponivelError();

      // Verifica horário consecutivo do mesmo usuário na mesma mesa (RN1 / RE3.1)
      const trintaMinutesAntes = new Date(horarioInicio.getTime() - DURACAO_RESERVA_MS);
      const consecutivo = await prisma.reserva.findFirst({
        where: {
          mesaId: body.mesaId,
          usuarioId,
          statusPagamento: { not: 'CANCELADO' },
          OR: [
            { horarioFim: horarioInicio }, // reserva anterior termina exatamente quando essa começa
            { horarioInicio: horarioFim }, // reserva posterior começa exatamente quando essa termina
            { horarioInicio: trintaMinutesAntes }, // reserva anterior começa 30min antes
          ],
        },
      });
      if (consecutivo) throw new HorarioConsecutivoError();

      const reserva = await prisma.reserva.create({
        data: {
          usuarioId,
          mesaId: body.mesaId,
          horarioInicio,
          horarioFim,
          statusPagamento: 'PENDENTE',
        },
      });

      return { ok: true, data: reserva };
    },
    {
      body: t.Object({
        mesaId: t.String(),
        horarioInicio: t.String({ format: 'date-time' }),
      }),
      detail: { tags: ['Reservas'] },
    },
  );

export default createReserva;
