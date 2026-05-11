// prisma/seed.ts

import { password } from 'bun';
import { prismaClient as prisma } from '../../src/db';
import { ADM_PASS, ADM_USER } from './env';

async function main() {
  console.log('Iniciando seed...');

  if (!ADM_PASS) {
    throw new Error('❌: Senha Adm não foi definida no .env');
  } else if (!ADM_USER) {
    throw new Error('❌: User Adm não foi definido no .env');
  }

  const senhaAdmHash = await password.hashSync(ADM_PASS, 'bcrypt');
  const senhaPadrao = await password.hashSync('senha123', 'bcrypt');

  console.log('👤Criando usuários de teste...');

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@funasinuca.com.br' },
    update: {
      senha: senhaAdmHash,
    },
    create: {
      nome: 'Administrador Chefe',
      email: 'admin@funasinuca.com.br',
      senha: senhaAdmHash,
      cpf: '00000000000',
      tipo: 'ADMINISTRADOR',
    },
  });

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'balcao@funasinuca.com.br' },
    update: { senha: senhaPadrao },
    create: {
      nome: 'Atendente Balcão',
      email: 'balcao@funasinuca.com.br',
      senha: senhaPadrao,
      cpf: '00000000000',
      tipo: 'FUNCIONARIO',
    },
  });

  const cliente = await prisma.usuario.upsert({
    where: { email: 'cliente@email.com' },
    update: { senha: senhaPadrao },
    create: {
      nome: 'João Cliente',
      email: 'cliente@email.com',
      senha: senhaPadrao,
      cpf: '00000000000',
      tipo: 'CLIENTE',
    },
  });

  console.log('🎱 Criando mesas...');

  const mesas = await Promise.all([
    prisma.mesa.upsert({
      where: { numero: 1 },
      update: {},
      create: { numero: 1, status: 'DISPONIVEL', ativa: true },
    }),
    prisma.mesa.upsert({
      where: { numero: 2 },
      update: {},
      create: { numero: 2, status: 'DISPONIVEL', ativa: true },
    }),
    prisma.mesa.upsert({
      where: { numero: 3 },
      update: {},
      create: { numero: 3, status: 'INDISPONIVEL', ativa: false },
    }),
  ]);

  console.log('📅 Criando reserva de teste...');

  const agora = new Date();
  const trintaMinutosDepois = new Date(agora.getTime() + 30 * 60000);

  const reservaTeste = await prisma.reserva.findFirst({
    where: { usuarioId: cliente.id, mesaId: mesas[0].id },
  });

  if (!reservaTeste) {
    await prisma.reserva.create({
      data: {
        usuarioId: cliente.id,
        mesaId: mesas[0].id,
        horarioInicio: agora,
        horarioFim: trintaMinutosDepois,
        statusPagamento: 'PAGO',
      },
    });

    await prisma.mesa.update({
      where: { id: mesas[0].id },
      data: { status: 'RESERVADA' },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
  console.log('--------------------------------------------------');
  console.log(`Email Admin: ${admin.email} | Senha: [OCULTA - CARREGADA DO .ENV]`);
  console.log(`Email Func:  ${funcionario.email} | Senha: senha123`);
  console.log(`Email Cli:   ${cliente.email} | Senha: senha123`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
