import Elysia from 'elysia';
import cancelarReserva from './cancel-reserva';
import confirmarPresenca from './confirmarPresenca';
import createReserva from './create-reserva';
import getMinhasReservas from './get-my-reservas';
import getReservas from './get-reservas';
import getDisponibilidade from './getDisponibilidade';
import getRelatorio from './getRelatorio';
import updateReserva from './update-reserva';

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
