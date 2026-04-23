# ---- Build Stage ----
FROM node:20-slim AS builder

# Instala OpenSSL necessário para o Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-slim AS production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs

EXPOSE 3020
CMD ["npm", "start"]
