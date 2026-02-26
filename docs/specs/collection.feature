# language: pt

Funcionalidade: Agendamento de Coleta de Recicláveis
  Como um cidadão consciente
  Eu quero agendar a coleta de materiais recicláveis na minha residência
  Para contribuir com o meio ambiente e organizar o descarte correto

  Cenário: Solicitar agendamento com sucesso
    Dado que eu preenchi o formulário com nome, endereço, telefone e materiais
    E selecionei uma data sugerida com pelo menos 2 dias úteis de antecedência
    Quando eu clicar em enviar
    Então o sistema deve registrar o agendamento como "Pendente"
    E deve gerar um número de protocolo único para acompanhamento

  Cenário: Tentar agendar com data retroativa ou muito próxima
    Dado que eu selecionei uma data sugerida para amanhã
    Quando eu tentar enviar o formulário
    Então o sistema deve exibir uma mensagem de erro informando a antecedência mínima necessária

  Cenário: Verificação de agendamentos por admin
    Dado que eu sou um usuário administrativo autenticado
    Quando eu acessar a listagem de agendamentos
    Então eu devo conseguir visualizar os detalhes e atualizar o status para "Agendado", "Concluído" ou "Cancelado"
