import { cron } from 'bun';
import { prismaClient as prisma } from '../db';

export const iniciar = () => {
  cron('* * * * *', async () => {
    const agora = new Date();

    await prisma.reserva.updateMany({
      where: {
        statusPagamento: 'PENDENTE',
        criadoEm: { lt: new Date(agora.getTime() - 30 * 60000) },
      },
      data: { statusPagamento: 'CANCELADO' },
    });

    await prisma.reserva.updateMany({
      where: {
        statusPagamento: 'PAGO',
        horarioInicio: { lt: new Date(agora.getTime() - 10 * 60000) },
        // aqui precisaria de um campo "presencaConfirmada" no schema
      },
      data: { statusPagamento: 'CANCELADO' },
    });
  });
};
