import Elysia from 'elysia';

import createMesa from './createMesa';
import deleteMesa from './deleteMesa';
import getMesas from './getMesas';
import updateMesa from './updateMesa';

const mesasGroup = new Elysia().group('/mesas', (app) =>
  app.use(getMesas).use(createMesa).use(updateMesa).use(deleteMesa),
);

export default mesasGroup;
