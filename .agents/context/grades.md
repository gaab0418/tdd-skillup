Testes de Software
Avaliação N2
Desenvolvimento de Software com
TDD
Objetivos
Este trabalho tem como objetivo principal capacitar os alunos no
desenvolvimento de software utilizando a metodologia Test-Driven
Development (TDD), aplicando os conceitos e práticas discutidos em sala
de aula e observados no projeto didático "Shortz-App-TDD". A cada aluno
já foi designado um dos projetos de software nas aulas passadas. Cada um
deve desenvolver o projeto proposto do zero, seguindo o ciclo Red-GreenRefactor e implementando diferentes categorias de testes automatizados.
Ao final do trabalho, espera-se que os alunos sejam capazes de:
Desenvolver um projeto Node.js do zero, com uma estrutura de pastas
organizada e moderna.
Aplicar o ciclo Red-Green-Refactor na construção de funcionalidades,
garantindo que os testes guiem o desenvolvimento.
Compreender e implementar testes unitários e testes de integração.
Demonstrar o uso de bibliotecas de asserção e mocking de forma
eficaz.
Produzir documentação e artefatos que evidenciem o processo de TDD
e a qualidade do código.
Estrutura Mínima do Projeto
O projeto deverá ser desenvolvido em Node.js, utilizando ESM (EcmaScript
Modules) e uma estrutura de pastas modular, similar à apresentada no
"Shortz-App-TDD".
Ferramentas Mínimas:
Framework Web: Express.js
Sistema de Testes: Vitest (com globals: true , environment: 'node' ,
setupFiles para mocks globais)
Mocks: vi.fn() , vi.mock() , vi.spyOn()
Testes de Integração HTTP: Supertest
ORM: Sequelize
Hash de Senhas: bcryptjs
Critérios de Avaliação por Faixa de Nota
Os requisitos são cumulativos. Para alcançar uma nota superior, todos os
requisitos das notas anteriores devem ser atendidos, além dos requisitos
específicos da faixa desejada.
Escala de Notas
As notas possíveis de alcançar são:
0,0 - zero
6,0 - seis
7,0 - sete
8,0 - oito
9,0 - nove
10,0 - dez
Qualquer trabalho entregue que não alcance os requisitos mínimos para a
nota 6,0 receberá nota 0,0 (zero) e o estudante automaticamente estará
inscrito para realizar uma prova substitutiva ao fim do semestre na qual será
cobrado todo o conteúdo teórico e prático da disciplina durante o
semestre.
Note que para atingir uma nota 7,0, o estudante deverá cumprir todos os
requisitos da nota 6,0 mais o requisitos da nota 7,0. Para atingir uma nota
8,0 o estudante deverá cumprir todos os requisitos da nota 6,0 mais os
requisitos da nota 7,0 e mais os requisitos da nota 8,0 e assim por diante.
Nota 6: Fundamentos do TDD e Testes Unitários
Entregas Obrigatórias:
1. Projeto Criado e Estruturado: Um projeto Node.js com estrutura de
pastas organizada ( src/ , src/modules/ ,
src/modules/user/__tests__/ , etc.) e package.json configurado para
Vitest.
2. Funcionalidade Principal Implementada com TDD: Escolha uma
funcionalidade central do projeto (ex: cadastro de usuário, criação de
item, etc.) e implemente-a seguindo o ciclo Red-Green-Refactor.
3. Testes Unitários (Mínimo 10):
Mínimo de 10 testes unitários para a camada de Service da
funcionalidade escolhida.
Os testes devem cobrir diferentes cenários (sucesso, falha,
validações de regras de negócio).
Uso de mocks para isolar dependências (ex: mockUserModel para
simular o banco de dados, como no Shortz-App-TDD ).
Uso de asserções variadas ( expect().toBe() , expect().toThrow() ,
expect().toHaveProperty() ).
4. Relatório Simples (Texto): Um arquivo Markdown ( RELATORIO.md )
explicando:
A funcionalidade escolhida e suas regras de negócio.
Como o TDD foi aplicado (breve descrição do ciclo Red-GreenRefactor).
Exemplos de 3 testes unitários, explicando o que cada um verifica.
Avaliação:
Rodar npm test e todos os testes unitários devem passar.
Clareza na estrutura do projeto e na aplicação do TDD na
funcionalidade principal.
Qualidade e abrangência dos testes unitários.
Nota 7: Apresentação e Cobertura de Testes
Além da Nota 6:
1. Apresentação em PowerPoint/PDF: Uma apresentação (mínimo 5
slides) contendo:
Visão geral do projeto e da funcionalidade implementada.
Explicação detalhada do ciclo TDD aplicado.
Demonstração de 5 testes unitários, com blocos de código e
explicação do que está sendo testado e verificado.
Explicação sobre o uso de mocks para isolamento.
2. Aumento de Testes Unitários (Mínimo 15): Total de 15 testes unitários
para a camada de Service, cobrindo mais cenários e regras de negócio.
3. Cobertura de Código: Configuração do Vitest para gerar relatório de
cobertura de código (ex: vitest run --coverage ). A cobertura de
linhas do Service testado deve ser de no mínimo 80%.
Avaliação:
Coerência entre a apresentação e o código/testes.
Qualidade da explicação dos conceitos de TDD e testes.
Alcance da cobertura de código mínima.
Nota 8: Testes de Integração e Vídeo Explicativo
Além da Nota 7:
1. Testes de Integração (Mínimo 5):
Mínimo de 5 testes de integração para a camada de
Controller/Rotas da funcionalidade principal, utilizando Supertest.
Os testes devem verificar o comportamento HTTP (status codes,
redirecionamentos) e a interação com o Service (que deve ser
mockado, como em user.controller.test.js do Shortz-AppTDD).
Cenários de sucesso e falha (ex: registro bem-sucedido, erro de
validação).
2. Vídeo Explicativo (mínimo de 8 minutos): Um vídeo (YouTube ou
OneDrive) demonstrando:
A execução dos testes unitários e de integração.
Explicação de função por função do Service e Controller,
mostrando a linha de código que é testada.
Navegação no editor de código para a função real em src/ que é
alvo do teste.
Explicação clara do que a função de produção faz, suas
entradas/saídas e como o teste valida seu comportamento.
3. Diagrama UML (Opcional, bônus): Um diagrama de classes ou de
sequência simples para a funcionalidade principal, evidenciando a
separação de camadas.
Avaliação:
Qualidade e abrangência dos testes de integração.
Clareza e didática do vídeo explicativo, evidenciando a conexão entre
testes e código de produção.
Todos os testes (unitários e de integração) devem passar.
Nota 9: Testes de API e Cenários Complexos
Além da Nota 8:
1. Aumento de Testes de Integração (Mínimo 10): Total de 10 testes de
integração para a camada de Controller/Rotas, cobrindo mais cenários
e fluxos (ex: login, logout, acesso a rotas protegidas).
2. Testes de API (Mínimo 5):
Pesquisa e implementação de 5 testes de API que simulem a
interação com uma API externa (ex: usando axios-mock-adapter
ou nock para mockar requisições HTTP dentro do Service -
considerando, para este exercício, que o projeto terá integração
com alguma API externa que você deverá buscar).
Alternativamente, se o projeto não tiver API externa, criar testes
que simulem chamadas a endpoints definidos em um arquivo
db.json (versão gratuita/sem login) usando json-server ou
similar, e testar a integração do seu Service com esses dados.
3. Refatoração Evidente: No relatório, documentar pelo menos 2
exemplos de refatoração significativa realizada durante o ciclo TDD,
explicando o "antes" e o "depois" e o benefício da mudança.
Avaliação:
Robustez dos testes de integração e de API.
Capacidade de lidar com cenários mais complexos e dependências
externas (mockadas).
Evidência de refatoração consciente e melhoria contínua do código.
Nota 10: Excelência e Demonstração Abrangente
Além da Nota 9:
1. Aumento de Testes (Total Mínimo 30): Garantir um total de pelo
menos 30 testes (unitários, integração, API) para a funcionalidade
principal e funcionalidades secundárias relevantes.
2. Vídeo de Demonstração com Insomnia/Postman (mínimo de 10
minutos): Um segundo vídeo demonstrando a execução dos testes de
API/integração usando uma ferramenta como Insomnia ou Postman.
Para cada cenário exibido, deve haver:
Referência ao arquivo de teste correspondente no projeto
(onde aquele cenário está automatizado).
Referência à função de produção em src/ exercitada pela
chamada (ex: o handler/serviço que monta a requisição/trata a
resposta), com uma breve explicação do papel dessa função
no fluxo.
Comparação com as funções de teste criadas no projeto (Notas 8 e
9).
3. Documentação Técnica Aprofundada: O relatório ( RELATORIO.md ) deve
incluir:
Um diagrama de arquitetura (ex: D2, Mermaid) mostrando as
camadas da aplicação e como os testes se encaixam.
Uma seção de "Lições Aprendidas" sobre os desafios e benefícios
do TDD no projeto.
Explicação sobre como a cobertura de código foi utilizada para
guiar o desenvolvimento.
4. Qualidade de Código: O código deve seguir padrões de estilo
consistentes (ex: ESLint configurado) e apresentar alta legibilidade.
Avaliação:
Excelência na aplicação do TDD e na qualidade dos testes em todas as
categorias.
Profundidade da documentação técnica e dos insights sobre o
processo de desenvolvimento.
Capacidade de demonstrar e explicar o funcionamento do sistema e
seus testes de forma abrangente e profissional.
Forma de Entrega
1. Projeto Completo Compactado (.zip): Incluindo todo o código-fonte e
as dependências ( node_modules pode ser omitido se o package.json e
package-lock.json estiver presente e permitir a reinstalação).
2. Materiais Adicionais: Conforme a faixa de nota escolhida
(apresentações .pptx/.pdf, vídeos via link no YouTube ou no OneDrive).
3. Envio: Via plataforma TEAMS na atividade N2, respeitando a data e
horário de entregas