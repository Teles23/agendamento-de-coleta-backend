# Plano de Testes - Sistema de Coletas Recicláveis

## 1. Visão Geral
Este plano descreve a estratégia de testes para garantir a qualidade e confiabilidade do sistema de agendamento de coletas.

## 2. Estratégia de Testes
A estratégia baseia-se na Pirâmide de Testes:
- **Testes Unitários**: Validar as regras de negócio isoladas (Protocolo, Datas, Status).
- **Testes de Integração/API**: Validar a comunicação entre as camadas e a persistência no banco.
- **Testes End-to-End (E2E)**: (A ser implementado no Frontend) Validar a jornada completa do cidadão.

## 3. Prioridades (Curto Prazo)
1. **P0 - Cadastro de Coleta**: Garantir que o formulário público funcione e gere o protocolo corretamente.
2. **P0 - Autenticação Admin**: Bloquear acessos não autorizados à listagem.
3. **P1 - Validação de Data**: Impedir agendamentos sem a antecedência mínima.

## 4. Estratégia de Execução
- **CI/CD**: Execução automática de testes unitários e lint a cada push.
- **Ambiente de Teste**: Utilizar um banco de dados temporário (em memória ou container separado) para testes de API para evitar poluição de dados e garantir idempotência.

## 5. Cobertura de Testes
A meta é atingir pelo menos 80% de cobertura nas camadas de `services` e `controllers`.
