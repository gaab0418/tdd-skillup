# Roteiro de Gravação do Vídeo Explicativo (Nota 8)

Este documento foi criado para te guiar na gravação do vídeo de +8 minutos exigido. Use isso como um *Teleprompter* e siga o passo a passo.

## Preparação antes de gravar:
1. Abra o VSCode na pasta raiz do projeto.
2. Abra um terminal no VSCode (`Ctrl + '`).

## Minuto 0:00 - 1:30 | Apresentação e Execução dos Testes
**Fala Sugerida:**
"Olá, meu nome é [Seu Nome], e esta é a demonstração prática do meu projeto para a Avaliação N2 de Testes de Software. O projeto escolhido foi uma plataforma de microaprendizado. Vou começar demonstrando a execução das baterias de testes."

**Ação:**
1. No terminal, digite `npm run test:coverage`.
2. Mostre o console executando os testes unitários e de integração de forma extremamente rápida por conta do isolamento.
3. Mostre a tabela do *Coverage* evidenciando a coluna do `userService` com 100% de cobertura.

## Minuto 1:30 - 4:00 | Camada Service (Produção e Testes Unitários)
**Ação:**
1. Abra o arquivo `modules/user/userService.js`.
2. Role até a função `deleteUser`.
**Fala Sugerida:**
"Na nossa camada de Serviços, que isola as regras de negócio da web, temos a função `deleteUser`. A linha chave desta função impede que um usuário comande a deleção do seu próprio perfil. Ela recebe o ID do usuário alvo e o ID de quem comandou, e dispara um erro se forem iguais."

**Ação:**
1. Abra o arquivo `modules/user/__tests__/userService.test.js`.
2. Mostre o teste `it('deve lançar erro se o usuário tentar deletar a própria conta...')`.
**Fala Sugerida:**
"Aqui no arquivo de testes, nós usamos a suíte Vitest com a ferramenta nativa de mocking `vi.mock` nas Models do Sequelize. No teste de exclusão simulamos essa chamada passando os mesmos IDs. A asserção `rejects.toThrow` valida exatamente a mensagem de erro da camada de produção provando que o TDD validou nossa regra."

## Minuto 4:00 - 6:30 | Camada Controller e Integração
**Ação:**
1. Abra o arquivo `modules/user/userController.js`.
2. Vá até a função `destroy` (rotina de deletar usuário).
**Fala Sugerida:**
"Já na nossa camada Web, o Controller de exclusão. Ele recebe a requisição HTTP (o método POST pela rota `:id/excluir`) e apenas extrai os parâmetros. Em vez de lidar com negócio, ele chama nossa `userService` e reage com um redirecionamento 302 dependendo do sucesso ou falha."

**Ação:**
1. Abra o arquivo `modules/user/__tests__/userController.test.js`.
2. Mostre o mock no topo do arquivo (auth e userService) e o quinto teste da listagem.
**Fala Sugerida:**
"Para os Testes de Integração, usamos a biblioteca `Supertest`. Nós passamos a instância do servidor Express (`app`) mockando a camada de autenticação para simular um Admin logado. Usamos os Mocks do Vitest novamente, desta vez para isolar a Service. Nós enviamos uma requisição `.post()` e avaliamos os outputs HTTP: validamos se a resposta `.status` foi efetivamente 302 e se os redirecionamentos de URL `.headers.location` levaram o fluxo de volta à listagem como planejado, garantindo integração com sucesso."

## Minuto 6:30 - 8:00+ | Encerramento e Conclusão
**Ação:** Volte ao terminal mostrando todos os cenários aprovados.
**Fala Sugerida:**
"Mostramos que a arquitetura modular ajudou na isolação: a camada Service cuidando apenas dos dados, com testes puramente focados no algoritmo, e a camada Controller focada nas Entradas/Saídas (Inputs HTTP e Redirects) validada via Supertest, tudo sem sujar um banco de dados real. Obrigado."
