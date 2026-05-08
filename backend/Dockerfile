# apps/backend/Dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copia os arquivos de dependência primeiro (otimiza o cache do Docker)
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Instala as dependências
RUN bun install

# Gera o Prisma Client
RUN bunx prisma generate

# Copia o restante do código
COPY . .

# Expõe a porta do Elysia
EXPOSE 3000

# O comando de inicialização será definido no docker-compose
