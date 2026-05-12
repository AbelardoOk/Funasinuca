import { Elysia, t } from 'elysia';
import { StatusMesa } from '../../../prisma/prismabox/StatusMesa';
import auth from '../../lib/auth';
import prisma from '../../lib/db';

const updateMesa = new Elysia()
  .use(auth)
  .use(prisma)
  .patch(
    '/:id',
    async ({ requireFuncionario, prisma, params, body, set }) => {
      await requireFuncionario();

      const mesa = await prisma.mesa.findUnique({
        where: { id: params.id },
      });

      if (!mesa) {
        set.status = 404;
        return { ok: false, error: 'Mesa não encontrada' };
      }

      const mesaAtualizada = await prisma.mesa.update({
        where: { id: params.id },
        data: body,
      });

      return { ok: true, data: mesaAtualizada };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object(
        {
          numero: t.Optional(t.Number()),
          status: t.Optional(t.Enum(StatusMesa)),
          ativa: t.Optional(t.Boolean()),
        },
        { error: 'Informe ao menos um campo para atualizar' },
      ),
      detail: { tags: ['Mesas'] },
    },
  );

export default updateMesa;
