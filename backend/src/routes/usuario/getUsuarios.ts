import { Elysia, t } from 'elysia';
import auth from '../../lib/auth';
import prisma from '../../lib/db';

const getUsuarios = new Elysia()
  .use(auth)
  .use(prisma)
  .get(
    '/',
    async ({ requireAdmin, prisma, query }) => {
      await requireAdmin();

      const usuarios = await prisma.usuario.findMany({
        where: {
          ...(query.tipo && { tipo: query.tipo }),
          ...(query.ativo !== undefined && { ativo: query.ativo === 'true' }),
          ...(query.busca && {
            OR: [
              { nome: { contains: query.busca, mode: 'insensitive' } },
              { email: { contains: query.busca, mode: 'insensitive' } },
            ],
          }),
        },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          tipo: true,
          ativo: true,
          criadoEm: true,
        },
        orderBy: { criadoEm: 'desc' },
      });

      return { ok: true, data: usuarios };
    },
    {
      query: t.Object({
        tipo: t.Optional(
          t.Union([t.Literal('CLIENTE'), t.Literal('FUNCIONARIO'), t.Literal('ADMINISTRADOR')]),
        ),
        ativo: t.Optional(t.String()),
        busca: t.Optional(t.String()),
      }),
      detail: { tags: ['Usuários'] },
    },
  );

export default getUsuarios;
