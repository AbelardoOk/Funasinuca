# 🎱 Funasinuca

> Sistema para Agendamento de Atividades de Bares

O **Funasinuca** é uma solução digital desenvolvida para otimizar a gestão e reserva de mesas de sinuca em estabelecimentos como o bar _"Batata+"_. O sistema visa substituir processos manuais e informais por uma plataforma automatizada, garantindo rotatividade justa, transparência na fila de espera e facilidade de pagamento para os clientes.

---

## 📌 Sobre o Projeto

O sistema foi idealizado para resolver problemas comuns em bares locais de Campo Grande, como a desorganização de filas e a perda silenciosa de faturamento por falta de controle operacional.

### Principais Funcionalidades

- **Web/Mobile (Cliente):** Cadastro, consulta de disponibilidade em tempo real, reserva de mesas com duração fixa de 30 minutos e pagamento online.
- **Desktop (Administrativo):** Painel de gestão local para funcionários, controle de status das mesas (`disponível`, `reservada`, `indisponível`, `atrasada`) e relatórios de desempenho para administradores.

---

## 🛠️ Tecnologias Utilizadas

| Camada         | Tecnologia                |
| -------------- | ------------------------- |
| Frontend       | Next.js 16.2 (App Router) |
| Desktop        | Tauri (Rust + Vite)       |
| Backend        | Bun / NestJS              |
| ORM            | Prisma                    |
| Banco de Dados | PostgreSQL 16             |
| Infraestrutura | Docker & Docker Compose   |

---

## 🚀 Como Iniciar

### Pré-requisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- _(Para desenvolvimento Tauri)_ [Rust](https://www.rust-lang.org/tools/install) instalado na máquina host

### 1. Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/funasinuca.git
cd funasinuca
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# Banco de Dados
DATABASE_URL="postgresql://dev_user:dev_password@postgres:5432/db?schema=public"

# Credenciais Administrativas
ADM_USER="admin"
ADM_PASSWD="sua_senha_segura"

# Integrações Externas
EXTERNAL_API_URL="https://api.exemplo.com"
EXTERNAL_API_TOKEN="seu_token_aqui"
```

### 3. Execução com Docker Compose

O comando abaixo irá subir o banco de dados PostgreSQL, o backend (com migrations automáticas) e o frontend web:

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
cd TauriApp
bun install
bun run tauri dev
```

---

## 📋 Regras de Negócio

| Regra                  | Descrição                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **RN1** — Duração      | Cada reserva tem duração fixa de **30 minutos**                                                           |
| **RN2** — Pagamento    | O pagamento deve ser feito em até **30 minutos** após a reserva, ou ela será cancelada automaticamente    |
| **RN4** — Cancelamento | Reembolsos são permitidos apenas para cancelamentos com **24h de antecedência**                           |
| **Tolerância**         | O sistema cancela a reserva automaticamente em caso de atraso superior a **10 minutos** no comparecimento |

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
