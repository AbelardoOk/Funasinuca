import cron from 'node-cron';
import { prismaClient as prisma } from '../lib/db';

let rodando = false;

export const iniciarJobs = () => {
  cron.schedule('* * * * *', async () => {
    if (rodando) return;
    rodando = true;

    try {
      const agora = new Date();

      const { count: canceladosPendentes } = await prisma.reserva.updateMany({
        where: {
          statusPagamento: 'PENDENTE',
          criadoEm: { lt: new Date(agora.getTime() - 30 * 60_000) },
        },
        data: { statusPagamento: 'CANCELADO' },
      });

      const { count: canceladosNoShow } = await prisma.reserva.updateMany({
        where: {
          statusPagamento: 'PAGO',
          presencaConfirmada: false,
          horarioInicio: { lt: new Date(agora.getTime() - 10 * 60_000) },
        },
        data: { statusPagamento: 'CANCELADO' },
      });

      if (canceladosPendentes > 0 || canceladosNoShow > 0) {
        console.log(
          `[Job] ${agora.toISOString()} — pendentes: ${canceladosPendentes}, no-show: ${canceladosNoShow}`,
        );
      }
    } catch (err) {
      console.error('[Job] Erro ao executar job de cancelamento:', err);
    } finally {
      rodando = false;
    }
  });
};
