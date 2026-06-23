import Elysia, { t } from 'elysia';
import Stripe from 'stripe';
import auth from '../../lib/auth';
import { VALOR_MESA } from '../../lib/constants';
import prisma from '../../lib/db';

// Inicializa o Stripe usando a chave do .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

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

      // Garante que o Stripe saiba para onde devolver o usuário
      const frontendUrl =
        process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 3001}`;

      try {
        // Cria a sessão de checkout
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'brl',
                product_data: {
                  name: `Reserva Mesa ${reserva.mesa.numero}`,
                  description: 'Horário garantido na Funasinuca',
                },
                // Stripe exige o valor em centavos. Ex: R$ 50,00 -> 5000
                unit_amount: VALOR_MESA * 100,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          // IDs no final da URL para você tratar o status no front se quiser
          success_url: `${frontendUrl}/dashboard?status=sucesso&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontendUrl}/dashboard?status=falha`,
          client_reference_id: reserva.id, // Muito útil para o Webhook depois
        });

        return {
          ok: true,
          data: {
            checkoutUrl: session.url, // Retornamos a URL pronta gerada pelo Stripe
          },
        };
      } catch (error) {
        console.error('Erro ao gerar Stripe Checkout:', error);
        set.status = 500;
        return { ok: false, error: 'Falha na comunicação com o Stripe' };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ['Reservas'] },
    },
  );

export default criarPagamento;
