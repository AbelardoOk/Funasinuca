import Elysia from 'elysia';
import cancelarReserva from './cancel-reserva';
import createReserva from './create-reserva';
import getMinhasReservas from './get-my-reservas';
import getReservas from './get-reservas';
import updateReserva from './update-reserva';

const reservaGroup = new Elysia().group(
  '/reservas',
  (app) =>
    app
      .use(getMinhasReservas) // GET /api/reservas/minhas
      .use(getReservas) // GET /api/reservas
      .use(createReserva) // POST /api/reservas
      .use(cancelarReserva) // PATCH /api/reservas/:id/cancelar
      .use(updateReserva), // PATCH /api/reservas/:id
);

export default reservaGroup;
