import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
  path: envPath,
});

export const ADM_USER = process.env.ADM_USER;
export const ADM_PASS = process.env.ADM_PASSWD;
