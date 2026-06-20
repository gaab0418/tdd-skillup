# Relatório Técnico - N3 (SkillUp)

## 1. Nova Funcionalidade: Módulo de Lições (Lesson)

### Descrição

A funcionalidade implementada é o **módulo de Lições** do SkillUp, que permite:

- **Visualizar lições** (player) com currículo do curso e progresso do aluno.
- **Marcar lições como concluídas** e registrar minutos assistidos.
- **Adicionar comentários** em lições.
- **Curtir/descurtir comentários** (toggle like).

### Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN-01 | Somente lições com status `published` podem ser acessadas pelo player. |
| RN-02 | Se a lição pertence a um curso, o usuário precisa estar inscrito (`UserCourse`) para acessá-la. |
| RN-03 | O currículo exibido no player é composto por todas as lições publicadas do mesmo curso, ordenadas por `order`. |
| RN-04 | Se a lição é avulsa (sem `courseId`), ela mesma é o currículo. |
| RN-05 | O progresso pode ser marcado como `completed=true` (registra data de conclusão) ou `completed=false` (limpa a data). |
| RN-06 | Os minutos assistidos (`watchedMinutes`) são registrados como inteiro. |
| RN-07 | Comentários não podem ser vazios nem conter apenas espaços. |
| RN-08 | Likes funcionam como toggle: se já curtiu, remove; se não, adiciona. O contador nunca fica negativo. |

### Camadas Implementadas

- **Model**: `Lesson.js`, `Progress.js`, `Comment.js`, `Like.js` (models Sequelize)
- **Service**: `lessonService.js` — lógica de negócio
- **Controller**: `lessonController.js` — tratamento de requisições HTTP
- **Routes**: `lessons.js` — definição das rotas Express

---

## 2. Aplicação do TDD (Ciclo Red-Green-Refactor)

### Processo

O desenvolvimento seguiu rigorosamente o ciclo TDD:

#### 🔴 RED (Testes falhando)

1. O `lessonService.js` e `lessonController.js` foram **esvaziados**, deixando todos os métodos como stubs que lançam `throw new Error('Not implemented')`.
2. Os testes unitários e de integração foram escritos **antes** da implementação.
3. Ao rodar `npm test`, **todos os 25 novos testes falharam** (15 unitários + 10 de integração), confirmando a fase Red.

Exemplo — Stub vazio do Service:
```javascript
const lessonService = {
  async getLessonPlayer(lessonId, userId) {
    throw new Error('Not implemented');
  },
  async updateProgress(lessonId, userId, data) {
    throw new Error('Not implemented');
  },
  // ...
};
```

Exemplo — Teste unitário (falhando contra o stub):
```javascript
it('deve lançar LessonServiceError quando a lição não é encontrada', async () => {
  Lesson.findByPk.mockResolvedValue(null);
  await expect(lessonService.getLessonPlayer(99, 1))
    .rejects
    .toThrow(LessonServiceError);
});
```

Resultado: `❌ expected error to be instance of LessonServiceError` — o stub lança `Error` genérico, não `LessonServiceError`.

#### 🟢 GREEN (Implementação mínima)

1. O `lessonService.js` foi reimplementado método por método para satisfazer cada teste.
2. O `lessonController.js` foi reimplementado para satisfazer os testes de integração.
3. Ao rodar `npm test`, **todos os 119 testes passaram** (incluindo os 25 novos).

Exemplo — Implementação que faz o teste passar:
```javascript
async getLessonPlayer(lessonId, userId) {
  const lesson = await Lesson.findByPk(lessonId, { include: [...] });
  if (!lesson || lesson.status !== 'published') {
    throw new LessonServiceError('Lição não encontrada.');
  }
  // ...
}
```

#### 🔵 REFACTOR

O código já seguia o padrão modular do projeto (Service → Controller → Routes), não sendo necessário refatoração estrutural significativa. A separação de responsabilidades entre camadas foi mantida.

---

## 3. Explicação de Testes

### 3.1 Testes Unitários (3 exemplos)

#### Teste 1: Lição não publicada deve ser rejeitada

```javascript
it('deve lançar LessonServiceError quando a lição é draft (não publicada)', async () => {
  Lesson.findByPk.mockResolvedValue({ id: 1, status: 'draft', courseId: null });
  await expect(lessonService.getLessonPlayer(1, 1))
    .rejects
    .toThrow('Lição não encontrada.');
});
```

- **O que verifica**: Que uma lição com `status: 'draft'` é tratada como inexistente.
- **Mock utilizado**: `Lesson.findByPk` retorna um objeto com `status: 'draft'` via `vi.fn()`.
- **Asserção**: `expect().rejects.toThrow()` — verifica que a Promise é rejeitada com a mensagem esperada.

#### Teste 2: Marcar lição como concluída

```javascript
it('deve marcar a lição como concluída (completed=true)', async () => {
  const mockProgress = {
    completed: false, completedAt: null, watchedMinutes: 0,
    save: vi.fn().mockResolvedValue(true),
  };
  Progress.findOrCreate.mockResolvedValue([mockProgress]);
  const result = await lessonService.updateProgress(1, 1, { completed: true });
  expect(result.completed).toBe(true);
  expect(result.completedAt).toBeInstanceOf(Date);
  expect(mockProgress.save).toHaveBeenCalled();
});
```

- **O que verifica**: Que ao enviar `completed: true`, o progresso é atualizado e `completedAt` recebe uma data.
- **Mock utilizado**: `Progress.findOrCreate` retorna um array com o objeto mock que possui um método `save` mockado via `vi.fn()`.
- **Asserções**: `toBe(true)`, `toBeInstanceOf(Date)`, `toHaveBeenCalled()` — verifica o valor booleano, o tipo da data e que o save foi chamado.

#### Teste 3: Comentário vazio deve ser rejeitado

```javascript
it('deve lançar LessonServiceError quando o conteúdo é vazio', async () => {
  await expect(lessonService.addComment(1, 1, ''))
    .rejects
    .toThrow('O comentário não pode ser vazio.');
});
```

- **O que verifica**: Validação de regra de negócio — comentários vazios não são permitidos.
- **Mock utilizado**: Nenhum mock é necessário, pois a validação ocorre antes de qualquer acesso ao banco.
- **Asserção**: `expect().rejects.toThrow()` — verifica que a mensagem de erro correta é lançada.

### 3.2 Testes de Integração (2 exemplos)

#### Teste 1: Carregar player de lição válida

```javascript
it('deve retornar 200 ao carregar o player de uma lição válida', async () => {
  lessonService.getLessonPlayer.mockResolvedValue({
    lesson: { id: 1, title: 'Aula Teste', status: 'published' },
    curriculum: [{ id: 1, title: 'Aula Teste', duration: 10, order: 1 }],
    userProgress: null, curriculumProgress: {}, completedCount: 0, userLikes: [],
  });
  const res = await request(app).get('/lessons/1');
  expect(res.status).toBe(200);
  expect(lessonService.getLessonPlayer).toHaveBeenCalledWith('1', 1);
});
```

- **O que verifica**: Que a rota `GET /lessons/:id` retorna status 200 e invoca o Service com os parâmetros corretos.
- **Mock utilizado**: `lessonService.getLessonPlayer` mockado via `vi.mock()` para retornar dados de uma lição válida, evitando acesso ao banco.
- **Asserção**: `toBe(200)` para status HTTP e `toHaveBeenCalledWith()` para verificar os argumentos passados ao Service.

#### Teste 2: Comentário vazio redireciona com erro

```javascript
it('deve redirecionar (302) com mensagem de erro ao enviar comentário vazio', async () => {
  lessonService.addComment.mockRejectedValue(
    new LessonServiceError('O comentário não pode ser vazio.')
  );
  const res = await request(app)
    .post('/lessons/5/comments')
    .send({ content: '' });
  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/lessons/5');
});
```

- **O que verifica**: Que ao tentar adicionar um comentário vazio, o Controller captura o `LessonServiceError` e redireciona de volta à lição (302).
- **Mock utilizado**: `lessonService.addComment` mockado para rejeitar com `LessonServiceError`.
- **Asserção**: `toBe(302)` para status de redirecionamento e `toBe('/lessons/5')` para verificar o destino.

---

## 4. Instruções para Rodar o Projeto

### Pré-requisitos

- Node.js v20+
- MySQL 8.0 (ou Docker)

### Instalação

```bash
npm install
```

### Configuração do `.env`

Copie o `.env.example` para `.env` e ajuste as variáveis de conexão com o banco de dados.

### Iniciar o servidor

```bash
npm run dev
```

### Rodar os testes

```bash
npm test
```

### Rodar com cobertura

```bash
npm run test:coverage
```

---

## 5. Resumo dos Testes

| Tipo | Arquivo | Qtd |
|------|---------|-----|
| Unitário | `modules/lesson/__tests__/lessonService.test.js` | 15 |
| Integração | `tests/integration/lesson.test.js` | 10 |
| Unitário | `modules/course/__tests__/courseService.test.js` | 13 |
| Integração | `modules/course/__tests__/courseController.test.js` | 11 |
| **Total (novos módulos lesson + course)** | | **49** |
| **Total (projeto)** | | **143** |

---

## 6. Cobertura de Código (Nota 7)

### Configuração

A cobertura foi configurada no `vitest.config.js` utilizando o provider `v8`, gerando relatórios em formato `text` (terminal) e `html` (pasta `coverage/`).

**Exclusões aplicadas** (conforme enunciado):

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  include: ['modules/**'],
  exclude: [
    'config/**',
    'middlewares/**',
    'app.js',
    'bin/**',
    'modules/**/__tests__/**',
    'modules/**/index.js',
  ],
}
```

### Resultados

| Módulo | Stmts (%) | Branch (%) | Funcs (%) | Lines (%) | Status |
|--------|-----------|------------|-----------|-----------|--------|
| **user** | 84.27 | 82.29 | 80.64 | 84.27 | ✅ ≥80% |
| **lesson** | 97.39 | 95.65 | 100 | 97.39 | ✅ ≥80% |
| **course** | 95.43 | 90.90 | 85.71 | 95.43 | ✅ ≥80% |

### Métricas Explicadas

| Métrica | Significado |
|---------|-------------|
| **Stmts** (Statements) | Percentual de declarações/instruções do código que foram executadas durante os testes. |
| **Branch** | Percentual de ramificações (if/else, ternários, switch) que foram exercitadas. |
| **Funcs** (Functions) | Percentual de funções/métodos que foram chamados ao menos uma vez. |
| **Lines** | Percentual de linhas de código-fonte efetivamente percorridas. |

### Como gerar o relatório

```bash
npm run test:coverage
```

O relatório HTML fica disponível em `coverage/index.html`.

