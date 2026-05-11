import { Elysia } from 'elysia';
import deleteUsuario from './deleteUsuario';
import getUsuarios from './getUsuarios';
import login from './login';
import register from './register';
import updateUsuario from './updateUsuarios';

const usuariosGroup = new Elysia({ prefix: '/usuarios' })
  .use(getUsuarios) // GET    /api/usuarios
  .use(updateUsuario) // PATCH  /api/usuarios/:id
  .use(deleteUsuario) // DELETE /api/usuarios/:id
  .use(login)
  .use(register);

export default usuariosGroup;
