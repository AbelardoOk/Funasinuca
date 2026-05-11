import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UsuarioPlain = t.Object(
  {
    id: t.String(),
    nome: t.String(),
    email: t.String(),
    cpf: __nullable__(t.String()),
    senha: t.String(),
    tipo: t.Union(
      [
        t.Literal("CLIENTE"),
        t.Literal("FUNCIONARIO"),
        t.Literal("ADMINISTRADOR"),
      ],
      { additionalProperties: false },
    ),
    ativo: t.Boolean(),
    criadoEm: t.Date(),
    atualizadoEm: t.Date(),
  },
  { additionalProperties: false },
);

export const UsuarioRelations = t.Object(
  {
    reservas: t.Array(
      t.Object(
        {
          id: t.String(),
          usuarioId: t.String(),
          mesaId: t.String(),
          horarioInicio: t.Date(),
          horarioFim: t.Date(),
          statusPagamento: t.Union(
            [t.Literal("PENDENTE"), t.Literal("PAGO"), t.Literal("CANCELADO")],
            { additionalProperties: false },
          ),
          presencaConfirmada: t.Boolean(),
          gatewayTransacaoId: __nullable__(t.String()),
          criadoEm: t.Date(),
          atualizadoEm: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const UsuarioPlainInputCreate = t.Object(
  {
    nome: t.String(),
    email: t.String(),
    cpf: t.Optional(__nullable__(t.String())),
    senha: t.String(),
    tipo: t.Optional(
      t.Union(
        [
          t.Literal("CLIENTE"),
          t.Literal("FUNCIONARIO"),
          t.Literal("ADMINISTRADOR"),
        ],
        { additionalProperties: false },
      ),
    ),
    ativo: t.Optional(t.Boolean()),
    criadoEm: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const UsuarioPlainInputUpdate = t.Object(
  {
    nome: t.Optional(t.String()),
    email: t.Optional(t.String()),
    cpf: t.Optional(__nullable__(t.String())),
    senha: t.Optional(t.String()),
    tipo: t.Optional(
      t.Union(
        [
          t.Literal("CLIENTE"),
          t.Literal("FUNCIONARIO"),
          t.Literal("ADMINISTRADOR"),
        ],
        { additionalProperties: false },
      ),
    ),
    ativo: t.Optional(t.Boolean()),
    criadoEm: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const UsuarioRelationsInputCreate = t.Object(
  {
    reservas: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const UsuarioRelationsInputUpdate = t.Partial(
  t.Object(
    {
      reservas: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const UsuarioWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          nome: t.String(),
          email: t.String(),
          cpf: t.String(),
          senha: t.String(),
          tipo: t.Union(
            [
              t.Literal("CLIENTE"),
              t.Literal("FUNCIONARIO"),
              t.Literal("ADMINISTRADOR"),
            ],
            { additionalProperties: false },
          ),
          ativo: t.Boolean(),
          criadoEm: t.Date(),
          atualizadoEm: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Usuario" },
  ),
);

export const UsuarioWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), email: t.String(), cpf: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ email: t.String() }),
            t.Object({ cpf: t.String() }),
          ],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              nome: t.String(),
              email: t.String(),
              cpf: t.String(),
              senha: t.String(),
              tipo: t.Union(
                [
                  t.Literal("CLIENTE"),
                  t.Literal("FUNCIONARIO"),
                  t.Literal("ADMINISTRADOR"),
                ],
                { additionalProperties: false },
              ),
              ativo: t.Boolean(),
              criadoEm: t.Date(),
              atualizadoEm: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Usuario" },
);

export const UsuarioSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      nome: t.Boolean(),
      email: t.Boolean(),
      cpf: t.Boolean(),
      senha: t.Boolean(),
      tipo: t.Boolean(),
      ativo: t.Boolean(),
      reservas: t.Boolean(),
      criadoEm: t.Boolean(),
      atualizadoEm: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UsuarioInclude = t.Partial(
  t.Object(
    { tipo: t.Boolean(), reservas: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const UsuarioOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      nome: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      cpf: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      senha: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ativo: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      criadoEm: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      atualizadoEm: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Usuario = t.Composite([UsuarioPlain, UsuarioRelations], {
  additionalProperties: false,
});

export const UsuarioInputCreate = t.Composite(
  [UsuarioPlainInputCreate, UsuarioRelationsInputCreate],
  { additionalProperties: false },
);

export const UsuarioInputUpdate = t.Composite(
  [UsuarioPlainInputUpdate, UsuarioRelationsInputUpdate],
  { additionalProperties: false },
);
