# Roteiro de Gravação — Vídeo Nota 10 (Insomnia/Postman)

Este vídeo deve ter **mínimo 10 minutos** e demonstrar chamadas HTTP reais no Insomnia/Postman, referenciando para cada cenário: o arquivo de teste e a função de produção correspondente.

## Preparação antes de gravar:
1. Rode `npm run dev` no terminal (servidor em http://localhost:3000).
2. Abra o **Insomnia** (ou Postman) com as requisições já criadas.
3. Abra o **VS Code** ao lado para mostrar os arquivos de teste e produção.
4. Layout: Insomnia (esquerda) + VS Code (direita), ou tela dividida.

---

## Minuto 0:00 - 0:45 | Apresentação

**Fala Sugerida:**
"Olá, eu sou [Seu Nome]. Neste vídeo vou demonstrar no Insomnia as mesmas chamadas HTTP que nossos testes de integração e API validam automaticamente. Para cada cenário, vou mostrar o arquivo de teste correspondente e a função de produção exercitada."

---

## Minuto 0:45 - 1:30 | Health Check

**Requisição no Insomnia:**
- `GET http://localhost:3000/health`
- Resposta esperada: `200 OK` com `{ "status": "ok" }`

**Mostrar no VS Code:**
- **Teste:** `tests/integration/health.test.js` — verifica que a rota retorna status 200 e JSON correto.
- **Produção:** `modules/core/health.js` — rota simples que responde com JSON de status para monitoramento.

**Fala Sugerida:**
"Começando pelo health check. No Insomnia recebo 200 com status ok. No teste, o Supertest faz exatamente essa mesma requisição e valida o status code e o body."

---

## Minuto 1:30 - 3:00 | Login e Autenticação

**Requisição no Insomnia:**
- `POST http://localhost:3000/auth/login`
- Body (Form URL Encoded): `email=admin@admin.com` / `password=admin123`
- Resposta: 302 redirect + cookie `connect.sid`

**Mostrar no VS Code:**
- **Produção:** `modules/auth/authController.js` → função `login()` — recebe credenciais, valida com bcrypt, cria sessão e redireciona.

**Fala Sugerida:**
"Agora faço o login como admin. O Insomnia retorna 302 e um cookie de sessão. Essa sessão será usada em todas as próximas requisições. A função `login` no authController valida a senha com bcrypt e cria a sessão via express-session."

**Ação importante:** Copie o cookie `connect.sid` e configure-o no header das próximas requisições (no Insomnia: aba Headers → `Cookie: connect.sid=valor`).

---

## Minuto 3:00 - 5:30 | CRUD de Usuários

### 3.1 — Criar Usuário

**Requisição:**
- `POST http://localhost:3000/admin/usuarios`
- Body: `{ "name": "Teste Video", "email": "teste@video.com", "password": "123456" }`
- Resposta esperada: `302` redirect para `/admin/usuarios`

**Mostrar no VS Code:**
- **Teste:** `modules/user/__tests__/userController.test.js` → teste "POST /admin/usuarios deve redirecionar (302) para lista após sucesso"
- **Produção:** `modules/user/userController.js` → `store()` — extrai dados do body e chama `userService.createUser()`
- **Service:** `modules/user/userService.js` → `createUser()` — verifica e-mail duplicado, faz hash da senha, cria no banco

**Fala Sugerida:**
"Criando um usuário via POST. Recebo 302 — o mesmo status que nosso teste valida. O controller `store` extrai os dados e delega para `createUser` na service, que valida duplicidade de e-mail e faz o hash."

### 3.2 — Tentar Excluir a Própria Conta (Regra de Negócio)

**Requisição:**
- `POST http://localhost:3000/admin/usuarios/1/excluir`
- (O admin logado tem ID 1, então está tentando excluir a si mesmo)
- Resposta esperada: 302 redirect com mensagem de erro no flash

**Mostrar no VS Code:**
- **Teste:** `modules/user/__tests__/userService.test.js` → teste "deve lançar erro se o usuário tentar deletar a própria conta"
- **Produção:** `modules/user/userService.js` → `deleteUser()` — contém a validação `if (editUser.id === currentUserId) throw new UserServiceError(...)`

**Fala Sugerida:**
"Agora o cenário chave: tento excluir minha própria conta. A aplicação bloqueia com erro. No teste unitário, mockamos `findByPk` e validamos que a service lança o erro. Na função `deleteUser`, a linha que compara os IDs impede a autoexclusão."

### 3.3 — Excluir Outro Usuário (Sucesso)

**Requisição:**
- `POST http://localhost:3000/admin/usuarios/2/excluir`
- Resposta: 302 redirect para `/admin/usuarios`

**Fala Sugerida:**
"Excluindo outro usuário funciona normalmente — 302 de sucesso. A comparação com o cenário anterior mostra a regra de negócio funcionando."

---

## Minuto 5:30 - 8:30 | API ViaCEP

### 5.1 — CEP Válido

**Requisição:**
- `GET http://localhost:3000/profile/api/cep?cep=89231630`
- Resposta: `200` com JSON do endereço (logradouro, bairro, localidade, uf)

**Mostrar no VS Code:**
- **Teste:** `modules/user/__tests__/viaCep.test.js` → teste "deve retornar dados de endereço quando o CEP é válido"
- **Produção:** `modules/user/userService.js` → `buscarDadosPorCep()` — sanitiza o CEP, faz fetch na API ViaCEP, retorna JSON
- **Controller:** `modules/user/userController.js` → `getCep()` — extrai query param e chama a service

**Fala Sugerida:**
"Buscando CEP válido. A resposta traz o endereço completo. No teste, fazemos mock do `fetch` global e validamos o mesmo retorno. Na service, a função `buscarDadosPorCep` primeiro limpa o CEP com regex, valida que tem 8 dígitos, e só então faz o fetch."

### 5.2 — CEP Inválido (formato errado)

**Requisição:**
- `GET http://localhost:3000/profile/api/cep?cep=abc`
- Resposta: `400` ou mensagem de erro

**Mostrar no VS Code:**
- **Teste:** `viaCep.test.js` → "deve lançar erro se o CEP tiver formato inválido"
- **Produção:** `userService.js` → validação `if (cleanCep.length !== 8) throw new UserServiceError('CEP inválido')`

**Fala Sugerida:**
"Com CEP inválido, a service nem chama o fetch — ela valida antes e retorna erro imediato. Isso foi uma refatoração que fizemos guiados pelo TDD: escrevemos o teste primeiro, vimos que falhava, e adicionamos a validação."

### 5.3 — CEP Inexistente

**Requisição:**
- `GET http://localhost:3000/profile/api/cep?cep=00000000`
- Resposta: erro (CEP não encontrado)

**Mostrar no VS Code:**
- **Teste:** `viaCep.test.js` → "deve lançar erro quando o CEP não existe (retorno com erro: true)"
- **Produção:** tratamento do `{ erro: true }` retornado pela API ViaCEP

### 5.4 — Busca por Endereço

**Requisição:**
- `GET http://localhost:3000/profile/api/cep/buscar?uf=SC&cidade=Joinville&rua=Rua%20XV`
- Resposta: array de endereços encontrados

**Mostrar no VS Code:**
- **Teste:** `viaCep.test.js` → "deve retornar lista de endereços ao buscar por texto"
- **Produção:** `userService.js` → `buscarCepPorEndereco()` — monta URL com UF/cidade/rua e faz fetch
- **Controller:** `userController.js` → `searchCep()`

**Fala Sugerida:**
"Aqui demonstro a busca reversa — dado um endereço, o ViaCEP retorna os CEPs possíveis. No teste mockamos o fetch retornando um array. Na service, a função monta a URL concatenando UF, cidade e rua."

---

## Minuto 8:30 - 10:00 | CRUD de Conteúdo (Lições)

**Requisição:**
- `GET http://localhost:3000/admin/conteudo` — lista lições
- `POST http://localhost:3000/admin/conteudo/criar` (multipart/form-data com arquivo de vídeo) — cria lição
- `POST http://localhost:3000/admin/conteudo/:id/excluir` — exclui lição

**Mostrar no VS Code:**
- **Teste:** `modules/admin/__tests__/contentController.test.js` (15 testes)
- **Produção:** `modules/admin/contentController.js` → `store()`, `destroy()`
- **Service:** `modules/admin/contentService.js` → `createLesson()`, `deleteLesson()`

**Fala Sugerida:**
"No CRUD de conteúdo, cada operação passa pelo controller que delega para a service. Os 15 testes no `contentController.test.js` cobrem cenários de sucesso e erro para cada rota — exatamente o que estou fazendo manualmente aqui no Insomnia."

---

## Minuto 10:00 - 11:00 | Comparação e Encerramento

**Ação:** Volte ao terminal e rode `npm test`.

**Fala Sugerida:**
"Para encerrar, vou rodar toda a suíte de testes. Cada cenário que demonstrei manualmente no Insomnia está automatizado aqui — 90 testes executando em menos de 2 segundos, sem depender de internet ou banco real. A diferença é que no Insomnia testamos o sistema rodando de verdade, end-to-end. Nos testes automatizados, isolamos camadas com mocks para ter velocidade e determinismo. Ambos se complementam: o Insomnia valida o comportamento real, os testes automatizados garantem que nenhuma regressão passe despercebida. Obrigado."

---

## Checklist Final

- [ ] Vídeo tem 10+ minutos
- [ ] Usou Insomnia ou Postman para cada requisição
- [ ] Cada cenário referenciou o arquivo de teste
- [ ] Cada cenário referenciou a função de produção com explicação do papel dela
- [ ] Comparou chamada manual vs teste automatizado
- [ ] Mostrou testes rodando no final
