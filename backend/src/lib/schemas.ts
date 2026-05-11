import { t } from 'elysia';

export const StatusPagamentoSchema = t.Union([
  t.Literal('PENDENTE'),
  t.Literal('PAGO'),
  t.Literal('CANCELADO'),
]);

export const StatusMesaSchema = t.Union([
  t.Literal('DISPONIVEL'),
  t.Literal('RESERVADA'),
  t.Literal('INDISPONIVEL'),
  t.Literal('ATRASADA'),
]);
