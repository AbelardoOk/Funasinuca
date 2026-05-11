import cron from 'node-cron';
import { prismaClient as prisma } from '../lib/db';

export const iniciarJobs = () => {
  cron.schedule('* * * * *', async () => {
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
        presencaConfirmada: false,
        horarioInicio: { lt: new Date(agora.getTime() - 10 * 60000) },
      },
      data: { statusPagamento: 'CANCELADO' },
    });
  });
};
