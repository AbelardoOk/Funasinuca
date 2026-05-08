import { PrismaPg } from '@prisma/adapter-pg';
import Elysia from 'elysia';
import { PrismaClient } from '../prisma/generated/client/client';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
export const prismaClient = new PrismaClient({ adapter });

const prisma = new Elysia().decorate('prisma', prismaClient);
export default prisma;
