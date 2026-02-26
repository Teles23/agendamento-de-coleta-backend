# Backend - Agendamento de Coleta de Recicláveis

Este é o backend da aplicação de agendamento de coleta de materiais recicláveis, desenvolvido como parte da prova prática.

## Tecnologias Utilizadas
- **Node.js**: Runtime Javascript.
- **Express**: Framework para API HTTP.
- **Prisma**: ORM para comunicação com PostgreSQL.
- **PostgreSQL**: Banco de dados relacional.
- **JWT (Json Web Token)**: Autenticação administrativa.
- **Jest & Supertest**: Testes unitários e de API.
- **Docker**: Orquestração do banco de dados.

## Configuração e Execução (RQNF7)

### Pré-requisitos
- Node.js v20+
- Docker & Docker Compose

### Passos
1. **Instalar dependências**:
   ```bash
   cd backend
   npm install
   ```

2. **Subir Banco de Dados**:
   ```bash
   docker-compose up -d
   ```

3. **Configurar Variáveis de Ambiente**:
   O arquivo `.env` já contém as configurações padrão. Ajuste o `JWT_SECRET` se necessário.

4. **Rodar Migrações e Seed**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Iniciar Servidor**:
   ```bash
   npm run dev
   ```
   A API estará disponível em `http://localhost:3000`.

## Documentação Técnica

### Especificações Gherkin (RQNF9)
As especificações de uso em formato Gherkin podem ser encontradas em: `backend/docs/specs/collection.feature`.

### Plano de Testes (RQNF10)
Localização: `backend/docs/test_plan.md`.
**Estratégia**: Foco inicial em testes unitários para regras de negócio críticas (validação de data e geração de protocolo) e testes de API para garantir a integridade dos contratos e segurança (autenticação).

### Revisão de Código e Melhorias (RQNF8)
Durante o desenvolvimento, identifiquei as seguintes melhorias possíveis:
1. **Holidays API**: A validação de dias úteis atualmente só considera finais de semana. Integrar uma API de feriados nacionais/locais aumentaria a precisão.
2. **Refresh Tokens**: Implementar refresh tokens para melhorar a experiência do usuário administrativo sem comprometer a segurança.
3. **Logging**: Adicionar um sistema de logs robusto (Winston ou Pino) para monitoramento em produção.
4. **Caching**: Utilizar Redis para cachear a lista de materiais, reduzindo a carga no banco.

### Relatório de Bugs (RQNF11)
- **ID001**: O campo de telefone aceita caracteres não numéricos.
  - **Severidade**: Baixa.
  - **Correção Sugerida**: Aplicar máscara no frontend e sanitização via Regex no backend.

### Requisitos Não Atendidos (RQNF12)
- Todos os requisitos funcionais solicitados para o backend foram atendidos.
- **RQNF13 (SonarQube)**: Não foi possível rodar o SonarQube localmente devido a restrições de tempo de processamento no ambiente atual, mas o código segue princípios de Clean Code.

## Testes (RQNF2 e RQNF5)
Para rodar os testes:
```bash
npm test
```
- **Unitários**: Testam as regras de negócio do `CollectionService`.
- **API**: Testam o endpoint de criação e validação de dados.
