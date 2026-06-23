import Elysia, { t } from 'elysia';
import Stripe from 'stripe';
import auth from '../../lib/auth';
import prisma from '../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

const verificarPagamento = new Elysia()
  .use(auth)
  .use(prisma)
  .post(
    '/verificar-pagamento',
    async ({ body, getUserId, prisma, set }) => {
      const usuarioId = await getUserId();
      const { sessionId } = body;

      try {
        // 1. Busca os dados reais daquela sessão direto no Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Confirma se o status está como 'paid' (pago)
        if (session.payment_status === 'paid' && session.client_reference_id) {
          const reservaId = session.client_reference_id;

          // 3. Garante que a reserva existe e é daquele usuário logado
          const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });

          if (reserva && reserva.usuarioId === usuarioId) {
            // 4. Marca como PAGO no banco
            await prisma.reserva.update({
              where: { id: reservaId },
              data: { statusPagamento: 'PAGO' },
            });
            return { ok: true, message: 'Pagamento confirmado com sucesso' };
          }
        }

        set.status = 400;
        return { ok: false, error: 'Pagamento não efetuado ou inválido' };
      } catch (error) {
        console.error('Erro ao verificar Stripe:', error);
        set.status = 500;
        return { ok: false, error: 'Erro de comunicação com o Stripe' };
      }
    },
    {
      body: t.Object({ sessionId: t.String() }),
      detail: { tags: ['Reservas'] },
    },
  );

export default verificarPagamento;
