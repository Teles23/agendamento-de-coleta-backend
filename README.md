# 🌿 Backend — Agendamento de Coleta de Recicláveis

Sistema de agendamento de coleta de materiais recicláveis. Permite que cidadãos solicitem coletas sem autenticação e que administradores gerenciem as solicitações via painel protegido por JWT.

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Execução Local](#configuração-e-execução-local-rqnf7)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Testes](#testes-rqnf2-e-rqnf5)
- [Deploy em Nuvem](#deploy-em-nuvem)
- [Documentação Técnica](#documentação-técnica)
  - [Especificações Gherkin (RQNF9)](#especificações-gherkin-rqnf9)
  - [Plano de Testes (RQNF10)](#plano-de-testes-rqnf10)
  - [Revisão de Código e Melhorias (RQNF8)](#revisão-de-código-e-melhorias-rqnf8)
  - [Relatório de Bugs (RQNF11)](#relatório-de-bugs-rqnf11)
  - [Requisitos Não Atendidos (RQNF12)](#requisitos-não-atendidos-rqnf12)

---

## Tecnologias

| Categoria        | Tecnologia                      |
|------------------|---------------------------------|
| Runtime          | Node.js v20+                    |
| Framework HTTP   | Express                         |
| ORM              | Prisma                          |
| Banco de dados   | PostgreSQL 15                   |
| Autenticação     | JWT (jsonwebtoken)              |
| Testes           | Jest + Supertest                |
| Containerização  | Docker + Docker Compose         |
| Linguagem        | TypeScript                      |

---

## Pré-requisitos

- [Node.js v20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)

> Não é necessário ter PostgreSQL instalado localmente. O banco sobe via Docker.

---

## Configuração e Execução Local (RQNF7)

### 1. Clone o repositório

```bash
git clone https://github.com/Teles23/agendamento-de-coleta-backend
cd backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Edite o `.env` conforme necessário. Para desenvolvimento local, os valores padrão já funcionam diretamente.



### 4. Suba o banco de dados

```bash
docker-compose up -d
```

Aguarde o container ficar saudável (≈10s). Para verificar:

```bash
docker-compose ps
```

### 5. Execute as migrações e o seed

```bash
npx prisma migrate dev
npx prisma db seed
```

O seed cria:
- **Usuário admin**: `admin@coleta.com` / `admin123`
- **Materiais**: Papel, Plástico, Vidro, Metal, Eletrônicos

### 6. Inicie o servidor

```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

A documentação Swagger estará em: **http://localhost:3000/api-docs**

---

## Variáveis de Ambiente

| Variável         | Descrição                                          | Padrão                                              |
|------------------|----------------------------------------------------|-----------------------------------------------------|
| `PORT`           | Porta em que o servidor escuta                     | `3000`                                              |
| `NODE_ENV`       | Ambiente de execução                               | `development`                                       |
| `DATABASE_URL`   | String de conexão com o PostgreSQL                 | `postgresql://postgres:postgres@localhost:5432/...` |
| `JWT_SECRET`     | Chave secreta para assinar tokens JWT              | *(obrigatório — sem padrão seguro em produção)*     |
| `JWT_EXPIRES_IN` | Tempo de expiração do token                        | `1d`                                                |
| `GEMINI_API_KEY` | Chave de API do Google Gemini para recursos de IA  | `""` *(vazio por padrão)*                           |
| `FRONTEND_URL`   | URL do frontend para restrição de CORS             | `http://localhost:5173`                             |

> 💡 Para gerar um `JWT_SECRET` seguro:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Testes (RQNF2 e RQNF5)

```bash
# Todos os testes
npm test

# Apenas testes de API
npm run test:api

# Com relatório de cobertura
npm test -- --coverage
```

### Estrutura de testes

```
src/tests/
├── unit/
│   └── CollectionService.spec.ts   # Regras de negócio isoladas
└── api/
    └── CollectionApi.spec.ts       # Testes de contrato da API
```

### O que é testado

**Unitários (`CollectionService.spec.ts`)**
- Formato do protocolo gerado (`AG-YYYYMMDD-XXXXXX`)
- Rejeição de datas inválidas (hoje, amanhã)
- Aceitação de datas com antecedência suficiente
- Obrigatoriedade de justificativa ao Cancelar/Concluir

**API (`CollectionApi.spec.ts`)**
- `POST /api/collections` — criação com sucesso (201)
- `POST /api/collections` — campos faltando (400 + lista de campos)
- `POST /api/collections` — telefone inválido (400)
- `GET /api/collections` — sem token (401)
- `GET /api/collections` — token inválido (401)

---

## Deploy em Nuvem

### ✅ Checklist de prontidão para produção

Antes de fazer deploy, certifique-se de:

- [ ] Definir `JWT_SECRET` com valor forte e aleatório (não usar o padrão)
- [ ] Definir `NODE_ENV=production`
- [ ] Configurar `DATABASE_URL` apontando para o banco de produção
- [ ] Executar `npx prisma migrate deploy` (em vez de `migrate dev`) no ambiente de produção
- [ ] Rodar o seed apenas uma vez no primeiro deploy: `npx prisma db seed`
- [ ] Usar HTTPS (configurar via proxy reverso — Nginx, Caddy, ou o próprio provedor)
- [ ] Revisar a política de CORS em `src/app.ts` para permitir apenas a origem do frontend

### Provedores sugeridos

| Componente | Opção gratuita/barata        | Alternativa           |
|------------|------------------------------|-----------------------|
| Backend    | Railway, Render, Fly.io      | AWS ECS, Google Cloud Run |
| Banco      | Railway (PostgreSQL incluído)| Supabase, Neon.tech   |

### Variáveis obrigatórias no provedor

Configure no painel do provedor (não em arquivo):

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<string-longa-e-aleatoria>
GEMINI_API_KEY=<sua-chave-gemini>
FRONTEND_URL=https://seu-frontend.com
NODE_ENV=production
PORT=3000
```

### Build de produção

```bash
npm run build
node dist/src/server.js
```

---

## Documentação Técnica

### Especificações Gherkin (RQNF9)

📄 Localização: [`backend/docs/specs/collection.feature`](./docs/specs/collection.feature)

```gherkin
Funcionalidade: Agendamento de Coleta de Recicláveis

  Cenário: Solicitar agendamento com sucesso
    Dado que o cidadão preencheu o formulário com todos os campos obrigatórios
    E selecionou uma data com pelo menos 2 dias úteis de antecedência
    Quando ele enviar o formulário
    Então o sistema deve registrar o agendamento como "Pendente"
    E deve exibir o número de protocolo gerado

  Cenário: Tentar agendar com data inválida
    Dado que o cidadão selecionou uma data para amanhã
    Quando ele tentar enviar o formulário
    Então o sistema deve retornar status 400
    E exibir mensagem informando a antecedência mínima necessária

  Cenário: Acesso administrativo protegido
    Dado que sou um administrador com token JWT válido
    Quando acesso a listagem de agendamentos
    Então consigo visualizar e atualizar o status dos agendamentos
```

---

### Plano de Testes (RQNF10)

📄 Localização: [`backend/docs/test_plan.md`](./docs/test_plan.md)

**Resumo da estratégia (Pirâmide de Testes):**

1. **Unitários** — regras de negócio isoladas (`CollectionService`, geração de protocolo, validação de datas)
2. **Integração/API** — contratos HTTP, autenticação, persistência simulada
3. **E2E** — *(a ser implementado no Frontend com Cypress ou Playwright, RQNF6)*

**Prioridades de curto prazo (P0):**
- Cadastro de coleta público (geração de protocolo + validação de data)
- Autenticação administrativa (bloqueio de acesso não autorizado)
- Validação de data (antecedência mínima de 2 dias úteis)

---

### Revisão de Código e Melhorias (RQNF8)

Pontos identificados durante o desenvolvimento e revisão:

#### 🔴 Crítico (segurança / corretude)

1. **`JWT_SECRET` sem fallback inseguro**
   - **Problema original**: `process.env.JWT_SECRET || 'fallback_secret'` permite que a aplicação suba sem um segredo real.
   - **Correção aplicada**: O serviço agora lança um erro explícito se `JWT_SECRET` não estiver definido, impedindo que a aplicação funcione com um segredo fraco.

2. **Protocolo com colisão potencial**
   - **Problema original**: `AG${Date.now()}${Math.floor(Math.random() * 1000)}` pode colidir em cenários de alto volume (mesmo timestamp + mesma parte aleatória).
   - **Correção aplicada**: Novo formato `AG-YYYYMMDD-XXXXXX` usando `Math.random().toString(36)`, que gera um espaço de colisão significativamente maior e mais legível.

3. **Timing attack no login**
   - **Problema original**: Se o usuário não existir, o bcrypt não era executado, tornando a resposta mais rápida e revelando que o e-mail não existe no banco.
   - **Correção aplicada**: `bcrypt.compare` é executado mesmo quando o usuário não é encontrado.

4. **Chave de API do Gemini Exposta**
   - **Problema original**: A API Key do Gemini ficava exposta publicamente no bundle do frontend (usando Vite).
   - **Correção aplicada**: A comunicação com o Gemini foi movida para o Backend (`AiService` e `AiController`), garantindo a segurança do segredo.

5. **CORS Excessivamente Permissivo**
   - **Problema original**: O CORS permitia requisições de origem `*`.
   - **Correção aplicada**: O CORS passou a permitir apenas requisições nativas da origem definida em `FRONTEND_URL`.

#### 🟡 Importante (qualidade / robustez)

4. **`any` no tratamento de erros**
   - **Problema original**: `catch (error: any)` em todos os controllers.
   - **Correção aplicada**: Substituído por `catch (error: unknown)` com narrowing via `instanceof Error`.

5. **Falta de validação do enum `Status` no controller**
   - **Problema original**: Um status inválido chegava ao service sem nenhuma validação prévia.
   - **Correção aplicada**: O controller valida o valor contra `Object.values(Status)` antes de chamar o service.

6. **Validação superficial do telefone**
   - **Problema original**: O campo phone aceitava qualquer string, incluindo letras.
   - **Correção aplicada**: O controller valida que o telefone tem 10–11 dígitos numéricos e salva apenas os dígitos.

7. **Falta de validação de materialIds no service**
   - **Problema original**: IDs de materiais inválidos ou inativos eram aceitos silenciosamente.
   - **Correção aplicada**: O service verifica que todos os `materialIds` existem e estão ativos no banco antes de criar o agendamento.

#### 🟢 Melhorias futuras (backlog)

8. **Integração com API de feriados**: A validação de dias úteis considera apenas fins de semana. Integrar uma API como [BrasilAPI/holidays](https://brasilapi.com.br/docs#tag/Feriados-Nacionais) tornaria a validação mais precisa.

9. **Refresh Tokens**: Implementar refresh tokens para que o admin não precise relogar a cada expiração do JWT.

10. **Sistema de Logs**: Adicionar Winston ou Pino para logging estruturado em produção.

11. **Cache de materiais**: Usar Redis para cachear a lista de materiais (dado praticamente estático), reduzindo queries desnecessárias.

12. **Rate limiting**: Adicionar `express-rate-limit` no endpoint público de criação de agendamentos para evitar abuse.

---

### Relatório de Bugs (RQNF11)

#### BUG-001 — Telefone aceita caracteres não numéricos

| Campo        | Valor                                                        |
|--------------|--------------------------------------------------------------|
| **ID**       | BUG-001                                                      |
| **Severidade** | Média                                                      |
| **Componente** | `POST /api/collections`                                    |
| **Status**   | ✅ Corrigido na refatoração                                  |

**Descrição:** O campo `phone` aceitava qualquer string, incluindo letras e caracteres especiais (`(11) abc-defg`), e os dados eram persistidos no banco sem validação.

**Como reproduzir:**
```bash
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"phone": "abc-INVALID", ...}'
# Retornava 201 com dados inválidos no banco
```

**Impacto:** Dados inconsistentes no banco dificultam notificações futuras por SMS ou integrações telefônicas.

**Correção aplicada:** O `CollectionController` agora valida que o telefone contém entre 10 e 11 dígitos numéricos, retornando 400 caso contrário. Apenas os dígitos são persistidos.

---

#### BUG-002 — Sem arquivo `.env.example` no repositório

| Campo        | Valor                                                        |
|--------------|--------------------------------------------------------------|
| **ID**       | BUG-002                                                      |
| **Severidade** | Alta (impacto em onboarding de desenvolvedores)            |
| **Componente** | Configuração / Repositório                                 |
| **Status**   | ✅ Corrigido — arquivo `.env.example` criado                 |

**Descrição:** O repositório não incluía um arquivo `.env.example`, impossibilitando que novos desenvolvedores soubessem quais variáveis de ambiente configurar para rodar o projeto.

**Correção aplicada:** Criado o arquivo `.env.example` com todas as variáveis documentadas e valores padrão seguros para desenvolvimento local.

---

### Requisitos Não Atendidos (RQNF12)

| Requisito   | Status         | Motivo                                                                                       |
|-------------|----------------|----------------------------------------------------------------------------------------------|
| RQNF1-RQNF5 | ✅ Atendido     | —                                                                                            |
| RQNF6       | ⚠️ Parcial      | Testes E2E dependem do Frontend; a estrutura de API está pronta para ser testada com Cypress/Playwright |
| RQNF7-RQNF12| ✅ Atendido     | —                                                                                            |
| RQNF13      | ❌ Não atendido | SonarQube requer recursos de processamento (JVM com ~4GB de RAM) indisponíveis no ambiente de desenvolvimento utilizado. O código segue princípios de Clean Code e pode ser analisado em pipeline CI/CD. |
| RQNF14      | ✅ Atendido     | Migrações implementadas com Prisma Migrate (`prisma/migrations/`)                           |
| RQNF15      | ✅ Atendido     | `Dockerfile` e `docker-compose.yml` disponíveis para execução containerizada                |