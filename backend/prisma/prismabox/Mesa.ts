import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MesaPlain = t.Object(
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
);

export const MesaRelations = t.Object(
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

export const MesaPlainInputCreate = t.Object(
  {
    numero: t.Integer(),
    status: t.Optional(
      t.Union(
        [
          t.Literal("DISPONIVEL"),
          t.Literal("RESERVADA"),
          t.Literal("INDISPONIVEL"),
          t.Literal("ATRASADA"),
        ],
        { additionalProperties: false },
      ),
    ),
    ativa: t.Optional(t.Boolean()),
    criadoEm: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const MesaPlainInputUpdate = t.Object(
  {
    numero: t.Optional(t.Integer()),
    status: t.Optional(
      t.Union(
        [
          t.Literal("DISPONIVEL"),
          t.Literal("RESERVADA"),
          t.Literal("INDISPONIVEL"),
          t.Literal("ATRASADA"),
        ],
        { additionalProperties: false },
      ),
    ),
    ativa: t.Optional(t.Boolean()),
    criadoEm: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const MesaRelationsInputCreate = t.Object(
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

export const MesaRelationsInputUpdate = t.Partial(
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

export const MesaWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
    { $id: "Mesa" },
  ),
);

export const MesaWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), numero: t.Integer() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.String() }), t.Object({ numero: t.Integer() })],
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
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Mesa" },
);

export const MesaSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      numero: t.Boolean(),
      status: t.Boolean(),
      ativa: t.Boolean(),
      reservas: t.Boolean(),
      criadoEm: t.Boolean(),
      atualizadoEm: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MesaInclude = t.Partial(
  t.Object(
    { status: t.Boolean(), reservas: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const MesaOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      numero: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ativa: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Mesa = t.Composite([MesaPlain, MesaRelations], {
  additionalProperties: false,
});

export const MesaInputCreate = t.Composite(
  [MesaPlainInputCreate, MesaRelationsInputCreate],
  { additionalProperties: false },
);

export const MesaInputUpdate = t.Composite(
  [MesaPlainInputUpdate, MesaRelationsInputUpdate],
  { additionalProperties: false },
);
