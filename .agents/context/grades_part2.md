Testes de Software
Avaliação N3
Evolução do Projeto com TDD
Objetivos
Este trabalho é uma continuação direta da N2. Você deve evoluir o mesmo
projeto desenvolvido anteriormente, aprofundando a prática de TDD em
duas frentes: consolidar e ampliar o que já existe, e implementar uma nova
funcionalidade completa do sistema seguindo rigorosamente o ciclo RedGreen-Refactor.
Ao final do trabalho, espera-se que você seja capaz de:
Implementar uma nova funcionalidade Node.js do zero, com estrutura
de pastas organizada e moderna, integrada ao projeto já existente.
Aplicar o ciclo Red-Green-Refactor na construção de novas features,
garantindo que os testes guiem o desenvolvimento.
Compreender e implementar testes unitários, de integração, E2E e de
cobertura de código de forma progressiva e consciente.
Configurar pipelines de Integração Contínua (CI) com GitHub Actions.
Produzir documentação, apresentações e artefatos que evidenciem o
processo de TDD e a qualidade do código em níveis crescentes de
maturidade.
Ponto de Partida
Você deve utilizar o projeto entregue na N2 como base. Não é necessário
recriar nada — o trabalho começa de onde a N2 parou. Se a N2 foi
entregue com bugs ou testes falhando, este é o momento de corrigi-los
antes de avançar.
Nova Funcionalidade a Implementar
Você deve escolher uma segunda funcionalidade central do seu projeto
(diferente do cadastro de usuário já implementado na N2, por exemplo) e
desenvolvê-la do zero com TDD. A funcionalidade deve envolver
obrigatoriamente as camadas Service, Model, Controller e Routes,
seguindo o mesmo padrão modular do Shortz-App-TDD, distribuindo os
testes entre essas camadas.
Alguns exemplos por projeto:
MusicVibe: cadastro e listagem de músicas ou criação de playlists
CodeLab: submissão de solução para um desafio e registro de
pontuação
TravelBuddy: cadastro de destinos ou criação de roteiros
SkillUp: cadastro de lições e marcação de lições como concluídas
PhotoSphere: upload de fotos e organização em álbuns
QuizMaster: criação de quiz com perguntas e respostas
GreenLife: registro de ação sustentável com categorização
MovieMania: adição de filmes a listas de "assistidos" ou "a assistir"
Taskify: criação e conclusão de tarefas por categoria
CraftCorner: cadastro de tutorial com upload de imagem de capa
HealthSync: registro de medição de saúde por categoria
CivicWatch: cadastro de perfil político com propostas vinculadas
EduStream: cadastro de curso com aulas associadas
PodWave: cadastro de podcast e controle de progresso de episódios
RecipeMaster: cadastro de receita com ingredientes e imagem
FitTrack: registro de treino realizado e acompanhamento de progresso
GameVault: cadastro de jogo com avaliação e recomendação
NewsStream: cadastro de notícia com categorização por tema
EventHub: cadastro de evento cultural com data e local
Petflix: upload de vídeo educativo sobre pets com categorização
ArtGallery: upload de obra de arte com descrição e categoria
BookHub: cadastro de livro com marcação de progresso de leitura
Ferramentas Mínimas
As mesmas da N2:
Framework Web: Express.js
Sistema de Testes: Vitest (com globals: true , environment: 'node' ,
setupFiles )
Mocks: vi.fn() , vi.mock() , vi.spyOn()
Testes de Integração HTTP: Supertest
ORM: Sequelize
Hash de Senhas: bcryptjs
Adicionalmente, conforme a faixa de nota desejada:
Testes E2E: Playwright
CI: GitHub Actions
Testes de Mutação: Stryker (exclusivo para nota 10)
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
requisitos da nota 6,0 mais os requisitos da nota 7,0. Para atingir uma nota
8,0 o estudante deverá cumprir todos os requisitos da nota 6,0 mais os
requisitos da nota 7,0 e mais os requisitos da nota 8,0 e assim por diante.
Atenção! Você deve partir do projeto já entregue na N2 e adicionar os itens
abaixo. Ou seja, se você já tem 10 teste baseados no módulo Usuário,
deverá implementar os novos testes em outro módulo a sua escolha. Abaixo
segue apenas a descrição daquilo que deverá ser adicionado.
Nota 6: Nova Funcionalidade com Testes
Unitários e de Integração
Entregas Obrigatórias:
1. Nova Funcionalidade Implementada com TDD: Escolha uma
funcionalidade central do projeto (diferente daquela escolhida na N2) e
implemente-a seguindo o ciclo Red-Green-Refactor, distribuindo os
testes entre as camadas Service, Model, Controller e Routes.
2. Testes Unitários (Mínimo 10):
Mínimo de 10 testes unitários para a nova funcionalidade.
Os testes devem cobrir diferentes cenários (sucesso, falha,
validações de regras de negócio).
Uso de mocks para isolar dependências ( vi.fn() , vi.mock() ).
Uso de asserções variadas ( expect().toBe() , expect().toThrow() ,
expect().toHaveProperty() ).
3. Testes de Integração (Mínimo 10):
Mínimo de 10 testes de integração para a nova funcionalidade,
utilizando Supertest.
Os testes devem verificar status codes HTTP, redirecionamentos e
a interação com o Service mockado.
Cobrir cenários de sucesso e falha.
4. Relatório Técnico ( RELATORIO_N3.md ):
Descrição da nova funcionalidade escolhida e suas regras de
negócio.
Como o TDD foi aplicado (descrição do ciclo Red-Green-Refactor
com exemplos reais do projeto).
Explicação de 3 testes unitários e 2 testes de integração,
descrevendo o que cada um verifica, o mock utilizado e a asserção
aplicada.
Instruções para rodar o projeto e os testes ( npm install , npm
test ).
Avaliação:
Rodar npm test e todos os testes (unitários e de integração) devem
passar.
Clareza na estrutura do projeto e aplicação do TDD na nova
funcionalidade.
Qualidade e abrangência dos testes.
Nota 7: Cobertura de Código + Apresentação
Além da Nota 6:
1. Cobertura de Código (Mínimo 80% em 2 módulos):
Configurar o Vitest para gerar relatório de cobertura ( vitest run -
-coverage ) com as exclusões adequadas: src/config/** ,
src/middlewares/** , src/server.js , src/app.js .
A cobertura de linhas e funções dos módulos user (da N2) e do
novo módulo implementado nesta N3 deve ser de no mínimo 80%
cada.
O relatório de cobertura em HTML deve ser gerado e incluído na
entrega (pasta coverage/ ).
2. Aumento dos Testes Unitários (Mínimo 20 no total):
Total de 20 testes unitários considerando os dois módulos
(módulo escolhido da N2 + novo módulo da N3), cobrindo mais
cenários e regras de negócio.
3. Apresentação em PowerPoint ou PDF (Mínimo 8 slides):
Slide 1: Capa com nome do projeto e do aluno.
Slide 2: Visão geral da nova funcionalidade implementada e suas
regras de negócio.
Slides 3 e 4: Demonstração do ciclo Red-Green-Refactor aplicado,
com blocos de código reais mostrando o teste antes (Red) e o
código que o fez passar (Green).
Slides 5 e 6: Demonstração de 5 testes unitários com blocos de
código, explicando o que cada um verifica e qual mock foi
utilizado.
Slide 7: Relatório de cobertura de código — screenshot do
terminal ou do HTML gerado, com explicação das métricas (Stmts,
Branch, Funcs, Lines).
Slide 8: Conclusão com lições aprendidas sobre TDD nesta etapa.
Avaliação:
Coerência entre a apresentação e o código/testes.
Alcance da cobertura mínima nos dois módulos exigidos.
Qualidade da explicação do ciclo TDD e das métricas de cobertura.
Nota 8: Testes E2E com Playwright para 2
Módulos
Além da Nota 7:
1. Testes E2E com Playwright (Mínimo 3 testes por módulo, 2 módulos):
Configurar o Playwright no projeto ( playwright.config.js com
baseURL e webServer apontando para o servidor local).
Implementar no mínimo 3 testes E2E para o módulo de usuário
(ex.: fluxo de cadastro, login com sucesso, redirecionamento após
logout).
Implementar no mínimo 3 testes E2E para o novo módulo da N3
(ex.: criar um item pelo formulário, verificar que ele aparece na
listagem, tentar acessar a rota sem estar logado).
Os testes devem simular interações reais do usuário: navegar para
a página, preencher formulários, clicar em botões e verificar o
resultado na interface.
2. Vídeo Explicativo (Mínimo 8 minutos):
Demonstração da execução dos testes unitários, de integração e
E2E rodando no terminal e no navegador.
Explicação de pelo menos 2 testes E2E, mostrando no editor de
código o que cada instrução do Playwright faz ( page.goto ,
page.fill , page.click , expect(page) ).
Navegação no código de produção ( src/ ) para explicar quais
rotas e controllers são acionados por cada teste E2E.
3. Atualização do RELATORIO_N3.md :
Seção adicional descrevendo a estratégia de testes E2E: quais
fluxos foram testados, por que foram escolhidos e quais
dificuldades foram encontradas.
Avaliação:
Qualidade e abrangência dos testes E2E nos dois módulos.
Clareza e didática do vídeo explicativo, evidenciando a conexão entre
os testes E2E e o código de produção.
Todos os testes (unitários, integração e E2E) devem passar.
Nota 9: Integração Contínua com GitHub Actions
Além da Nota 8:
1. Pipeline de CI com GitHub Actions ( .github/workflows/ci.yml ):
O pipeline deve ser acionado a cada push e pull_request nas
branches main ou master .
Passos obrigatórios no pipeline:
Checkout do repositório.
Setup do Node.js (versão 20) com cache de dependências.
Instalação das dependências ( npm install ).
Criação automática do arquivo .env com as variáveis
necessárias.
Serviço MySQL via Docker ( image: mysql:8.0 ) com banco,
usuário e senha configurados diretamente no workflow.
Execução de todos os testes unitários e de integração ( npm
run test:run ).
Instalação dos navegadores do Playwright ( npx playwright
install --with-deps ).
Execução dos testes E2E ( npx playwright test ).
Upload do relatório do Playwright como artefato (retenção de
30 dias).
O pipeline deve passar com ícone verde (✅) na aba Actions do
repositório.
2. Repositório GitHub Público:
O projeto deve estar hospedado em um repositório GitHub
público (ou com o professor adicionado como colaborador).
A URL do repositório deve ser incluída na entrega.
3. Aumento Total de Testes (Mínimo 30):
Total de 30 testes considerando todas as categorias (unitários +
integração + E2E).
4. Diagrama de Sequência (UML):
Um diagrama de sequência para o fluxo principal da nova
funcionalidade (ex.: desde a requisição HTTP até a resposta,
passando por Controller → Service → Model → banco de dados).
Pode ser criado com Mermaid, Draw.io, PlantUML ou ferramenta
similar.
Incluir o diagrama no RELATORIO_N3.md (como imagem ou bloco
Mermaid).
Avaliação:
Pipeline de CI funcional e completo, passando com sucesso.
Robustez do conjunto de testes (30 no total).
Clareza e correção do diagrama de sequência.
Evidência de que o CI valida o código automaticamente a cada push.
Nota 10: Expansão para Novas Camadas de Teste
Além da Nota 9:
1. Testes de Mutação com Stryker (Mínimo 70% de Mutation Score):
Instalar e configurar o Stryker Mutator no projeto
( stryker.config.mjs ).
Executar os testes de mutação sobre o Service dos dois módulos
(user e o novo módulo da N3).
O Mutation Score de cada Service deve ser de no mínimo 70% —
isto é, ao menos 70% dos mutantes gerados pelo Stryker devem
ser detectados e mortos pelos testes existentes.
Incluir o relatório gerado pelo Stryker (HTML ou JSON) na pasta
reports/mutation/ .
2. Total de Testes (Mínimo 40):
Total de 40 testes considerando todas as categorias (unitários +
integração + E2E).
3. Segundo Vídeo: Demonstração de Testes de Mutação (Mínimo 6
minutos):
Explicação do conceito de testes de mutação: o que é um mutante,
o que significa matá-lo e por que isso mede a qualidade dos testes
de forma mais profunda do que a cobertura de linhas.
Demonstração da execução do Stryker no terminal.
Análise do relatório gerado: identificação de ao menos 2 mutantes
sobreviventes, explicação de por que sobreviveram e como os
testes poderiam ser melhorados para matá-los.
4. Documentação Técnica Aprofundada no RELATORIO_N3.md :
Diagrama de arquitetura (Mermaid ou similar) mostrando todas as
camadas do projeto e quais tipos de teste cobrem cada camada
(unitário → Service, integração → Controller/Routes, E2E →
interface, mutação → qualidade dos testes).
Seção "Lições Aprendidas": reflexão honesta sobre os desafios e
benefícios de cada tipo de teste aplicado ao longo da N2 e da N3.
Seção "Análise de Mutantes": tabela com os mutantes
sobreviventes encontrados pelo Stryker, a razão de sobrevivência e
a melhoria proposta para cada um.
Avaliação:
Configuração correta do Stryker e alcance do Mutation Score mínimo.
Profundidade da análise dos mutantes sobreviventes.
Qualidade e completude da documentação técnica final.
Capacidade de explicar e demonstrar todas as camadas de teste de
forma coesa e profissional.
Forma de Entrega
1. Projeto Completo Compactado ( .zip ): Incluindo todo o códigofonte. A pasta node_modules pode ser omitida se o package.json e o
package-lock.json estiverem presentes e permitirem a reinstalação.
2. URL do Repositório GitHub: Obrigatório para todos (necessário para
verificação do histórico do GitHub Actions a partir da nota 9; para notas
6, 7 e 8, recomendado mas não eliminatório).
3. Materiais Adicionais: Conforme a faixa de nota escolhida —
apresentações .pptx / .pdf , vídeos via link no YouTube ou OneDrive,
diagramas e relatórios de cobertura/mutação.
4. Envio: Via plataforma TEAMS na atividade N3, respeitando a data e
horário de entrega.