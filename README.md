# 🎱 Funasinuca

> Sistema para Agendamento de Atividades de Bares

O **Funasinuca** é uma solução digital desenvolvida para otimizar a gestão e reserva de mesas de sinuca em estabelecimentos como o bar _"Batata+"_. O sistema visa substituir processos manuais e informais por uma plataforma automatizada, garantindo rotatividade justa, transparência na fila de espera e facilidade de pagamento para os clientes.

---

## 📑 Sumário

- [📌 Sobre o Projeto](#-sobre-o-projeto)
- [🚀 Atores e Permissões](#-atores-e-permissões)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [⚙️ Como Iniciar](#️-como-iniciar)
- [📡 Rotas da API](#-rotas-da-api)
- [📋 Regras de Negócio](#-regras-de-negócio)
- [🗄️ Modelo de Dados](#️-modelo-de-dados)
- [🔒 Segurança](#-segurança)
- [🧪 Testes](#-testes)
- [🔮 Roadmap](#-roadmap)
- [👥 Equipe](#-equipe)

---

## 📌 Sobre o Projeto

O sistema foi idealizado para resolver problemas comuns em bares locais de Campo Grande, como a desorganização de filas e a perda silenciosa de faturamento por falta de controle operacional.

**Objetivos de Negócio:**

- Automatizar 100% o processo de reserva, eliminando métodos analógicos como cadernos e planilhas.
- Reduzir o tempo de ociosidade das mesas entre partidas.
- Evitar prejuízos causados por clientes que ocupam as mesas além do tempo pago.
- Aumentar o faturamento consolidado do setor de entretenimento do estabelecimento.
- Prevenir conflitos em filas por meio de um painel de monitoramento transparente.

### Principais Funcionalidades

- **Web/Mobile (Cliente):** Cadastro, consulta de disponibilidade em tempo real, reserva de mesas com duração fixa de 30 minutos e pagamento online.
- **Desktop (Administrativo):** Painel de gestão local para funcionários, controle de status das mesas (`disponível`, `reservada`, `indisponível`, `atrasada`) e relatórios de desempenho para administradores.

---

## 🚀 Atores e Permissões

| Ator              | Plataforma | Permissões                                                                            |
| ----------------- | ---------- | ------------------------------------------------------------------------------------- |
| **Cliente**       | Web/Mobile | Cadastro, consulta de disponibilidade, pagamento e cancelamento de reservas           |
| **Funcionário**   | Desktop    | Check-in, liberação de mesas, encerramento de partidas e intervenções de balcão       |
| **Administrador** | Desktop    | Controle total: cadastro de mesas, configurações, relatórios e gestão de funcionários |

---

## 🛠️ Tecnologias Utilizadas

| Camada         | Tecnologia              |
| -------------- | ----------------------- |
| Frontend       | Next.js (App Router)    |
| Desktop        | Tauri (Rust + Vite)     |
| Backend        | Bun + Elysia            |
| ORM            | Prisma 7                |
| Banco de Dados | PostgreSQL 16           |
| Infraestrutura | Docker & Docker Compose |

---

## ⚙️ Como Iniciar

### Pré-requisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- _(Para desenvolvimento Tauri)_ [Rust](https://www.rust-lang.org/tools/install) instalado na máquina host

### 1. Clonando o Repositório

```bash
git clone https://github.com/AbelardoOk/funasinuca.git
cd funasinuca
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# Configurações de URLs
API_URL="http://localhost:3000"       # http://backend:3000
FRONTEND_URL="http://localhost:3001"  # http://web:3001

# Autenticação e Segurança (Gere senhas fortes, ex: https://1password.com/password-generator/)
JWT_SECRET_KEY="sua_chave_secreta_jwt_aqui"
JWT_KEY="sua_chave_jwt_aqui"

# API Stripe - https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_sua_chave_secreta_do_stripe_aqui"

# Banco de Dados
DATABASE_URL="postgresql://dev_user:dev_password@postgres:5432/db?schema=public"

# Credenciais do Administrador Padrão
ADM_USER="admin"   # usuário de administrador
ADM_PASSWD="admin" # senha de administrador

# Portas de Serviço (Docker/Local)
BACKEND_PORT=3000
FRONTEND_PORT=3001
DESKTOP_PORT=3002
```

### 3. Execução com Docker Compose

O comando abaixo irá subir o banco de dados PostgreSQL, o backend (com migrations e seed automáticos) e o frontend web:

```bash
docker compose up --build
```

| Serviço       | URL                   |
| ------------- | --------------------- |
| Web App       | http://localhost:3001 |
| API Backend   | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 |

### 4. Iniciando o Ambiente Tauri (Desktop)

Para rodar a interface administrativa desktop em modo de desenvolvimento:

```bash
cd desktop
bun install
bun run tauri dev
```

---

## 📡 Rotas da API

### Autenticação / Usuários — `/api/usuarios`

| Método   | Rota        | Acesso  | Descrição                 |
| -------- | ----------- | ------- | ------------------------- |
| `POST`   | `/login`    | Público | Autenticação, retorna JWT |
| `POST`   | `/register` | Público | Cadastro de novo cliente  |
| `GET`    | `/`         | Admin   | Listagem de usuários      |
| `PATCH`  | `/:id`      | Admin   | Edição de usuário         |
| `DELETE` | `/:id`      | Admin   | Desativação de usuário    |

### Mesas — `/api/mesas`

| Método   | Rota   | Acesso      | Descrição                         |
| -------- | ------ | ----------- | --------------------------------- |
| `GET`    | `/`    | Funcionário | Lista mesas com filtros opcionais |
| `POST`   | `/`    | Funcionário | Cadastra nova mesa                |
| `PATCH`  | `/:id` | Funcionário | Atualiza dados da mesa            |
| `DELETE` | `/:id` | Admin       | Desativa mesa (soft delete)       |

### Reservas — `/api/reservas`

| Método  | Rota                      | Acesso      | Descrição                              |
| ------- | ------------------------- | ----------- | -------------------------------------- |
| `GET`   | `/disponibilidade`        | Autenticado | Consulta mesas disponíveis por horário |
| `GET`   | `/minhas`                 | Autenticado | Histórico de reservas do usuário       |
| `GET`   | `/`                       | Funcionário | Lista todas as reservas com filtros    |
| `GET`   | `/relatorio`              | Admin       | Relatório de uso e faturamento         |
| `POST`  | `/`                       | Autenticado | Cria nova reserva                      |
| `POST`  | `/:id/confirmar-presenca` | Funcionário | Confirma chegada do cliente            |
| `PATCH` | `/:id/cancelar`           | Autenticado | Cancela reserva                        |
| `PATCH` | `/:id`                    | Funcionário | Atualiza reserva manualmente           |

---

## 📋 Regras de Negócio

| Regra                                | Descrição                                                                                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN1** — Duração                    | Cada reserva tem duração fixa de **30 minutos**. Não é permitido reservar horários consecutivos na mesma mesa.                                            |
| **RN2** — Pagamento                  | O pagamento deve ser feito em até **30 minutos** após a criação da reserva, ou ela será cancelada automaticamente.                                        |
| **RN3** — Reserva pelo funcionário   | Funcionários podem cadastrar reservas para horários imediatos ou retroativos diretamente pelo sistema desktop.                                            |
| **RN4** — Cancelamento               | Reembolsos são permitidos apenas para cancelamentos com **24h de antecedência**. No-show de mais de **10 minutos** cancela automaticamente sem reembolso. |
| **RN5** — Status das mesas           | Status visível para clientes e funcionários: `disponível`, `reservada`, `indisponível`, `atrasada`.                                                       |
| **RN6** — Intervenção do funcionário | Funcionários podem sobrescrever regras do sistema em situações excepcionais, com registro da ação para auditoria.                                         |

---

## 🗄️ Modelo de Dados

```prisma
enum TipoUsuario     { CLIENTE | FUNCIONARIO | ADMINISTRADOR }
enum StatusPagamento { PENDENTE | PAGO | CANCELADO }
enum StatusMesa      { DISPONIVEL | RESERVADA | INDISPONIVEL | ATRASADA }

model Usuario  { id, nome, email, cpf, senha, tipo, ativo, reservas[] }
model Mesa     { id, numero, status, ativa, reservas[] }
model Reserva  { id, usuarioId, mesaId, horarioInicio, horarioFim,
                 statusPagamento, presencaConfirmada, gatewayTransacaoId }
```

---

## 🔒 Segurança

- **Senhas:** Criptografia com hash SHA-256.
- **Sessão:** Autenticação via Token JWT com expiração de 7 dias.
- **Uptime:** Infraestrutura com SLA de 99,5% de disponibilidade.
- **Auditoria:** Todas as intervenções de funcionários geram logs imutáveis no banco de dados.

### Requisitos Mínimos das Estações Desktop

| Componente          | Requisito                   |
| ------------------- | --------------------------- |
| Sistema Operacional | Windows 10 ou superior      |
| Processador         | Intel Core i3 / AMD Ryzen 3 |
| Memória RAM         | 4 GB                        |
| Armazenamento       | 2 GB                        |
| Resolução           | 1366×768 px                 |
| Consumo da App      | Máx. 150 MB de RAM          |

---

## 🧪 Testes

```bash
bun test                     # todos os testes
bun test tests/unit          # testes unitários
bun test tests/integration   # testes de integração
bun test --coverage          # com cobertura
```

---

## 🔮 Roadmap

- **Integração ERP/POS:** Conectar o pagamento das mesas às comandas eletrônicas de bebidas e alimentos do bar.
- **Notificações Ativas:** Lembretes e avisos de fila via WhatsApp e SMS.
- **Módulo de Torneios:** Gamificação, ranking local de jogadores e chaves competitivas.

---

## 👥 Equipe

- Abelardo Palácios Ribeiro
- João Gabriel Casa Grande Montanari Teixeira Salomão
- Miguel Ribeiro Bernal
- Vinícius Fialho Cominetti

---

<div align="center">
  <sub>UFMS — Campo Grande/MS — 2026</sub>
</div>
