import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const StatusMesa = t.Union(
  [
    t.Literal("DISPONIVEL"),
    t.Literal("RESERVADA"),
    t.Literal("INDISPONIVEL"),
    t.Literal("ATRASADA"),
  ],
  { additionalProperties: false },
);
