import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const StatusPagamento = t.Union(
  [t.Literal("PENDENTE"), t.Literal("PAGO"), t.Literal("CANCELADO")],
  { additionalProperties: false },
);
