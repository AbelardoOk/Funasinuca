import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';

const updateUsuario = new Elysia()
  .use(auth)
  .use(prisma)
  .patch(
    '/:id',
    async ({ requireAdmin, prisma, params, body, set }) => {
      await requireAdmin();

      const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
      if (!usuario) {
        set.status = 404;
        return { ok: false, error: 'Usuário não encontrado' };
      }

      if (body.tipo && usuario.tipo === 'ADMINISTRADOR' && body.tipo !== 'ADMINISTRADOR') {
        const totalAdmins = await prisma.usuario.count({
          where: { tipo: 'ADMINISTRADOR', ativo: true },
        });
        if (totalAdmins <= 1) {
          set.status = 422;
          return { ok: false, error: 'Não é possível remover o único administrador do sistema' };
        }
      }

      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: params.id },
        data: body,
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          tipo: true,
          ativo: true,
        },
      });

      return { ok: true, data: usuarioAtualizado };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        nome: t.Optional(t.String()),
        email: t.Optional(t.String()),
        cpf: t.Optional(t.String()), // <-- CPF adicionado no validador do Elysia!
        tipo: t.Optional(
          t.Union([t.Literal('CLIENTE'), t.Literal('FUNCIONARIO'), t.Literal('ADMINISTRADOR')]),
        ),
      }),
      detail: { tags: ['Usuários'] },
    },
  );

export default updateUsuario;