import Elysia from 'elysia';
import cancelarReserva from './cancelReserva';
import confirmarPresenca from './confirmarPresenca';
import createReserva from './createReserva';
import getDisponibilidade from './getDisponibilidade';
import getMinhasReservas from './getMyReservas';
import getRelatorio from './getRelatorio';
import getReservas from './getReservas';
import updateReserva from './updateReserva';

const reservaGroup = new Elysia({ prefix: '/reservas' })
  .use(getDisponibilidade) // GET  /api/reservas/disponibilidade
  .use(getRelatorio) // GET  /api/reservas/relatorio
  .use(getMinhasReservas) // GET  /api/reservas/minhas
  .use(getReservas) // GET  /api/reservas
  .use(createReserva) // POST /api/reservas
  .use(confirmarPresenca) // POST /api/reservas/:id/confirmar-presenca
  .use(cancelarReserva) // PATCH /api/reservas/:id/cancelar
  .use(updateReserva); // PATCH /api/reservas/:id

export default reservaGroup;
