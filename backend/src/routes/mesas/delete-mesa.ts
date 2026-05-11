// routes/mesas/deleteMesa.ts
import { Elysia, t } from 'elysia';
import auth from '../../auth';
import prisma from '../../db';

const deleteMesa = new Elysia()
  .use(auth)
  .use(prisma)
  .delete(
    '/:id',
    async ({ requireAdmin, prisma, params, set }) => {
      await requireAdmin(); // só admin pode deletar

      const mesa = await prisma.mesa.findUnique({
        where: { id: params.id },
      });

      if (!mesa) {
        set.status = 404;
        return { ok: false, error: 'Mesa não encontrada' };
      }

      // Desativa em vez de deletar (soft delete)
      const mesaDesativada = await prisma.mesa.update({
        where: { id: params.id },
        data: { ativa: false, status: 'INDISPONIVEL' },
      });

      return { ok: true, data: mesaDesativada };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ['Mesas'] },
    },
  );

export default deleteMesa;
