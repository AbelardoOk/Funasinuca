import Elysia from 'elysia';

import createMesa from './create-mesa';
import deleteMesa from './delete-mesa';
import getMesas from './get-mesas';
import updateMesa from './update-mesa';

const mesasGroup = new Elysia().group('/mesas', (app) =>
  app.use(getMesas).use(createMesa).use(updateMesa).use(deleteMesa),
);

export default mesasGroup;
