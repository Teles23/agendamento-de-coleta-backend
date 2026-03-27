# Backend - Agendamento de Coleta de Reciclaveis

Backend em `Node.js + Express + Prisma` para o sistema de agendamento de coleta. A aplicacao usa `PostgreSQL` e esta configurada para rodar com `Neon Postgres` em desenvolvimento e producao.

## Stack

- Node.js 20+
- Express
- Prisma
- PostgreSQL / Neon
- JWT
- Jest + Supertest
- TypeScript

## Variaveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Variaveis obrigatorias:

- `DATABASE_URL`: connection string pooled do Neon para a aplicacao em runtime
- `DIRECT_URL`: connection string direct do Neon para migrations do Prisma
- `JWT_SECRET`: segredo forte para assinatura JWT
- `FRONTEND_URL`: URL publica do frontend
- `NODE_ENV`: `development` ou `production`
- `PORT`: porta HTTP do backend

Observacao sobre Neon:

- Use a URL `pooled` em `DATABASE_URL`
- Use a URL `direct` em `DIRECT_URL`
- Nao crie tabelas manualmente no painel do Neon; o schema nasce pelas migrations do Prisma

## Desenvolvimento local com Neon

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar `.env`

Preencha `DATABASE_URL` e `DIRECT_URL` com as URLs do seu projeto Neon.

### 3. Aplicar schema no banco

Em banco vazio ou ambiente compartilhado, prefira:

```bash
npx prisma migrate deploy
```

Se estiver evoluindo schema localmente e criando novas migrations:

```bash
npx prisma migrate dev
```

### 4. Popular carga inicial

```bash
npm run db:seed
```

O seed cria:

- Admin: `admin@coleta.com` / `admin123`
- Materiais iniciais: Papel, Plastico, Vidro, Metal e Eletronicos

### 5. Rodar a API

```bash
npm run dev
```

Swagger:

```text
http://localhost:3000/api-docs
```

## Build e execucao

Gerar Prisma Client e compilar:

```bash
npm run build
```

Subir a API em modo de producao com migrations:

```bash
npm start
```

Subir apenas o servidor compilado, sem migrations:

```bash
npm run start:server
```

## Render + Neon

### Configuracao do servico no Render

- Build Command: `npm run build`
- Start Command: `npm start`

O comando de start executa:

```bash
prisma migrate deploy && node dist/src/server.js
```

### Variaveis de ambiente no Render

Configure no painel do Render:

```env
DATABASE_URL=postgresql://...-pooler.../dbname?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://.../dbname?sslmode=require&channel_binding=require
JWT_SECRET=<string-longa-e-aleatoria>
GEMINI_API_KEY=<sua-chave-se-usar-ia>
FRONTEND_URL=https://seu-frontend.com
NODE_ENV=production
PORT=3000
```

### Primeiro deploy em producao

1. Garantir que `DATABASE_URL` e `DIRECT_URL` apontam para o projeto Neon correto.
2. Fazer o deploy no Render.
3. Confirmar nos logs que `prisma migrate deploy` executou sem erro.
4. Executar o seed uma unica vez no ambiente de producao:

```bash
npm run db:seed
```

O seed e idempotente para `User` e `Material`, mas deve continuar sendo tratado como carga inicial unica.

## Testes

```bash
npm test
npm run test:api
```

## Estrutura relevante

- `prisma/schema.prisma`: datasource PostgreSQL com `DATABASE_URL` e `DIRECT_URL`
- `prisma/migrations/`: schema versionado do banco
- `prisma/seed.ts`: carga inicial
- `src/lib/prisma.ts`: client Prisma compartilhado

## Observacoes operacionais

- O `docker-compose.yml` pode continuar servindo para cenarios locais antigos, mas nao faz parte do fluxo de producao com Neon.
- Para producao, use `prisma migrate deploy`, nao `prisma migrate dev`.
- O frontend precisa apontar para a URL publica do backend no Render, e o backend precisa liberar essa origem em `FRONTEND_URL`.
