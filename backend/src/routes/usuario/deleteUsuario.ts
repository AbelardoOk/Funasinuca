import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';

const deleteUsuario = new Elysia()
  .use(auth)
  .use(prisma)
  .delete(
    '/:id',
    async ({ requireAdmin, prisma, params, set }) => {
      await requireAdmin();

      const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
      if (!usuario) {
        set.status = 404;
        return { ok: false, error: 'Usuário não encontrado' };
      }

      // Verifica se tem reservas futuras ativas
      const reservasFuturas = await prisma.reserva.count({
        where: {
          usuarioId: params.id,
          statusPagamento: { not: 'CANCELADO' },
          horarioInicio: { gt: new Date() },
        },
      });

      if (reservasFuturas > 0) {
        set.status = 422;
        return { ok: false, error: 'Usuário possui reservas futuras ativas — cancele-as primeiro' };
      }

      const usuarioDesativado = await prisma.usuario.update({
        where: { id: params.id },
        data: { ativo: false },
        select: { id: true, nome: true, email: true, ativo: true },
      });

      return { ok: true, data: usuarioDesativado };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ['Usuários'] },
    },
  );

export default deleteUsuario;
