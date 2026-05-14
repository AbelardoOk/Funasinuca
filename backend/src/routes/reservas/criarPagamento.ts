import Elysia, { t } from 'elysia';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import auth from '../../lib/auth';
import { VALOR_MESA } from '../../lib/constants';
import prisma from '../../lib/db';

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
});

const criarPagamento = new Elysia()
  .use(auth)
  .use(prisma)
  .post(
    '/:id/pagamento',
    async ({ getUserId, prisma, params, set }) => {
      const usuarioId = await getUserId();

      const reserva = await prisma.reserva.findUnique({
        where: { id: params.id },
        include: { mesa: true },
      });

      if (!reserva || reserva.usuarioId !== usuarioId) {
        set.status = 404;
        return { ok: false, error: 'Reserva não encontrada' };
      }

      if (reserva.statusPagamento !== 'PENDENTE') {
        set.status = 422;
        return { ok: false, error: 'Reserva não está pendente de pagamento' };
      }

      const preference = new Preference(mp);

      const response = await preference.create({
        body: {
          items: [
            {
              id: reserva.id,
              title: `Reserva Mesa ${reserva.mesaId}`,
              quantity: 1,
              unit_price: VALOR_MESA,
              currency_id: 'BRL',
            },
          ],
          external_reference: reserva.id,
          back_urls: {
            success: `${process.env.FRONTEND_URL}/reservas?status=sucesso`,
            failure: `${process.env.FRONTEND_URL}/reservas?status=falha`,
            pending: `${process.env.FRONTEND_URL}/reservas?status=pendente`,
          },
          auto_return: 'approved',
          notification_url: `${process.env.API_URL}/api/reservas/webhook`,
        },
      });

      return {
        ok: true,
        data: {
          preferenceId: response.id,
          initPoint: response.init_point, // produção
          sandboxInitPoint: response.sandbox_init_point, // sandbox/teste
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ['Reservas'] },
    },
  );

export default criarPagamento;
