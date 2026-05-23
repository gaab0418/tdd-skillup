Prévia de como será o trabalho de Testes de Software para N2
Essas definições ainda poderão sofrer alterações. Trata-se de um norteamento para
organização individual de cada estudante.
Objetivos
• Desenvolver um projeto Node.js do zero, com estrutura de pastas definida.
• Aplicar TDD na construção de um software com diferentes tipos de testes
automatizados.
• Aplicar testes unitários, de API e de integração
• Compreender e demonstrar o uso de assert, expect e should no Mocha/Chai.
• Progredir em etapas de complexidade crescente, de acordo com a faixa de nota
desejada (6–10).
Estrutura mínima do projeto baseada no modelo que o professor apresentou em sala
de aula
• Importante: o projeto deve usar ESM
Critérios de avaliação por faixa de nota

Nota 6
Entregas obrigatórias:
• Projeto criado e estruturado (src/ e test/).
• Funções implementadas com tema da rede social/blog.
• Testes unitários:
o mínimo 5 asserts diferentes (não apenas strictEqual → usar
também deepEqual, throws, doesNotThrow, match, etc.).
o mínimo 5 expects diferentes (não apenas .to.equal → usar
.to.have.property, .to.be.a, .to.contain, .to.have.lengthOf, etc.).
o mínimo 5 should diferentes. o Total mínimo: 20 testes
unitários só nessa parte.
• Testes mockados/stubados de API com Sinon (mínimo 5 testes).
Avaliação:
• Abrir projeto no VS Code.
• Rodar npm test e todos os testes passarem
• Conferir variações de asserts/expect/should.
Nota 7
Além da nota 6:
• Criar apresentação PowerPoint + versão em PDF contendo:
o Cada assert, expect e should utilizados. o Explicação objetiva de
funcionamento de cada um.
o Bloco de código do projeto mostrando seu uso.
Avaliação:
• Conferir correspondência entre apresentação e testes reais do projeto.
• Formato de entrega: .pptx + .pdf.
Nota 8
Além da nota 7:
• Criar novo arquivo de testes de API com chamadas reais ao
https://jsonplaceholder.typicode.com/
• Implementar todos os endpoints disponíveis no site.
• Criar vídeo (YouTube ou OneDrive) contendo: o Explicação função por
função de teste (unitários, mockados, APIs). o Explicação linha por linha de
cada teste.
o Demonstração no código-fonte de qual função é testada.
Ao apresentar cada função de teste (unitário, mockado/stub, API), o vídeo deve
também mostrar a função correspondente no código-fonte testado e explicá-la.
• Para cada teste:
1. Mostrar o nome do teste e explicar linha a linha o que ele verifica.
2. Navegar no editor até a função real em src/ que é alvo do teste.
3. Explicar a função de produção (o que faz, entradas/saídas, casos
contemplados).
4. Deixar claro como o teste valida o comportamento dessa função
(asserções usadas e por quê).
Avaliação:
• Rodar npm test → todos os testes devem passar.
• Conferir se todos os endpoints do JSONPlaceholder foram testados.
• Conferir link de vídeo.
• Estimativa: +20 ou mais funções de teste adicionais em relação à nota 6.
• Tempo médio esperado de vídeo: 35–50 min, considerando ~1–2 min por teste.
Nota 9
Além da nota 8:
• Criar novo arquivo de testes de integração com https://myjsonserver.typicode.com/
• Testar endpoints definidos no arquivo db.json (versão gratuita/sem login).
Avaliação:
• Rodar npm test → todos os testes devem passar.
• Conferir se os testes cobrem corretamente os endpoints simulados.
• Estimativa: +10 a 15 funções de teste adicionais em relação à nota 8.
Nota 10
Além da nota 9:
• Utilizar Insomnia para executar os testes de API (JSONPlaceholder) e integração
(My JSON Server).
• Criar vídeo explicativo contendo:
o Demonstração de cada teste executado no Insomnia. o Explicação
do que é um header (mostrando elementos comuns). o Explicação
do que retorna no body.
o Comparação com as funções de teste criadas no projeto (nota 8 e
9).
Além de demonstrar a execução dos testes de API/integração no Insomnia, para cada
cenário exibido deve haver:
• referência ao arquivo de teste correspondente no projeto (onde aquele cenário
está automatizado) e
• referência à função de produção em src/ exercitada pela chamada (ex.: o
handler/serviço que monta a requisição/trata a resposta), com uma breve
explicação do papel dessa função no fluxo.
Forma de Entrega
• Projeto completo compactado (.zip) com todas as dependências
(node_modules incluído).
• Materiais adicionais conforme faixa escolhida (pptx, pdf, vídeos via link).
• Enviar via plataforma TEAMS na atividade N2 respeitando a data e horário de
entrega