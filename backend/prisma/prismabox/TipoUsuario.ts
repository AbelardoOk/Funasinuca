import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TipoUsuario = t.Union(
  [t.Literal("CLIENTE"), t.Literal("FUNCIONARIO"), t.Literal("ADMINISTRADOR")],
  { additionalProperties: false },
);
