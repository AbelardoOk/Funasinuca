import { Elysia, t } from 'elysia';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import prisma from '../../lib/db';

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
});

const webhook = new Elysia().use(prisma).post(
  '/webhook',
  async ({ body, set, prisma }) => {
    if (body.type !== 'payment') {
      return { ok: true };
    }

    const payment = new Payment(mp);
    const pagamento = await payment.get({ id: body.data.id });

    const reservaId = pagamento.external_reference;
    const status = pagamento.status;

    if (!reservaId) return { ok: true };

    if (status === 'approved') {
      await prisma.reserva.update({
        where: { id: reservaId },
        data: {
          statusPagamento: 'PAGO',
          gatewayTransacaoId: String(pagamento.id),
        },
      });
    }

    if (status === 'rejected') {
      await prisma.reserva.update({
        where: { id: reservaId },
        data: { statusPagamento: 'CANCELADO' },
      });
    }

    set.status = 200;
    return { ok: true };
  },
  {
    body: t.Object({
      type: t.String(),
      data: t.Object({ id: t.Union([t.String(), t.Number()]) }),
    }),
    detail: { tags: ['Reservas'] },
  },
);

export default webhook;
