import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ReservaPlain = t.Object(
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
);

export const ReservaRelations = t.Object(
  {
    usuario: t.Object(
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
        criadoEm: t.Date(),
        atualizadoEm: t.Date(),
      },
      { additionalProperties: false },
    ),
    mesa: t.Object(
      {
        id: t.String(),
        numero: t.Integer(),
        status: t.Union(
          [
            t.Literal("DISPONIVEL"),
            t.Literal("RESERVADA"),
            t.Literal("INDISPONIVEL"),
            t.Literal("ATRASADA"),
          ],
          { additionalProperties: false },
        ),
        ativa: t.Boolean(),
        criadoEm: t.Date(),
        atualizadoEm: t.Date(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ReservaPlainInputCreate = t.Object(
  {
    horarioInicio: t.Date(),
    horarioFim: t.Date(),
    statusPagamento: t.Optional(
      t.Union(
        [t.Literal("PENDENTE"), t.Literal("PAGO"), t.Literal("CANCELADO")],
        { additionalProperties: false },
      ),
    ),
    presencaConfirmada: t.Optional(t.Boolean()),
    criadoEm: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const ReservaPlainInputUpdate = t.Object(
  {
    horarioInicio: t.Optional(t.Date()),
    horarioFim: t.Optional(t.Date()),
    statusPagamento: t.Optional(
      t.Union(
        [t.Literal("PENDENTE"), t.Literal("PAGO"), t.Literal("CANCELADO")],
        { additionalProperties: false },
      ),
    ),
    presencaConfirmada: t.Optional(t.Boolean()),
    criadoEm: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const ReservaRelationsInputCreate = t.Object(
  {
    usuario: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
    mesa: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ReservaRelationsInputUpdate = t.Partial(
  t.Object(
    {
      usuario: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
      mesa: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const ReservaWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
          gatewayTransacaoId: t.String(),
          criadoEm: t.Date(),
          atualizadoEm: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Reserva" },
  ),
);

export const ReservaWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
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
              usuarioId: t.String(),
              mesaId: t.String(),
              horarioInicio: t.Date(),
              horarioFim: t.Date(),
              statusPagamento: t.Union(
                [
                  t.Literal("PENDENTE"),
                  t.Literal("PAGO"),
                  t.Literal("CANCELADO"),
                ],
                { additionalProperties: false },
              ),
              presencaConfirmada: t.Boolean(),
              gatewayTransacaoId: t.String(),
              criadoEm: t.Date(),
              atualizadoEm: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Reserva" },
);

export const ReservaSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      usuarioId: t.Boolean(),
      mesaId: t.Boolean(),
      horarioInicio: t.Boolean(),
      horarioFim: t.Boolean(),
      statusPagamento: t.Boolean(),
      presencaConfirmada: t.Boolean(),
      gatewayTransacaoId: t.Boolean(),
      usuario: t.Boolean(),
      mesa: t.Boolean(),
      criadoEm: t.Boolean(),
      atualizadoEm: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReservaInclude = t.Partial(
  t.Object(
    {
      statusPagamento: t.Boolean(),
      usuario: t.Boolean(),
      mesa: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReservaOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      usuarioId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      mesaId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      horarioInicio: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      horarioFim: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      presencaConfirmada: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      gatewayTransacaoId: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Reserva = t.Composite([ReservaPlain, ReservaRelations], {
  additionalProperties: false,
});

export const ReservaInputCreate = t.Composite(
  [ReservaPlainInputCreate, ReservaRelationsInputCreate],
  { additionalProperties: false },
);

export const ReservaInputUpdate = t.Composite(
  [ReservaPlainInputUpdate, ReservaRelationsInputUpdate],
  { additionalProperties: false },
);
