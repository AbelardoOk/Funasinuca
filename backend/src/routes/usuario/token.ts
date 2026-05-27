import { Elysia } from 'elysia';
import auth from '../../lib/auth';

const validateToken = new Elysia().use(auth).get(
  '/validate',
  async ({ getUserId }) => {
    const userId = await getUserId();
    return { ok: true, data: { userId } };
  },
  {
    detail: { tags: ['Usuários'] },
  },
);

export default validateToken;
