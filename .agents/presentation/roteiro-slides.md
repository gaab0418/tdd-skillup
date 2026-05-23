# Conteúdo Bruto para Apresentação - Nota 7 (TDD e Vitest)

Aqui está o conteúdo formatado para você passar para a IA geradora de slides. Adaptei os títulos e as bibliotecas para refletirem exatamente o seu código (Vitest em vez de Chai/Sinon, plataforma de cursos em vez de Blog).

## SLIDE 1: Capa
**Título:** SkillUp: Microaprendizado e Testes de Software
**Subtítulo:** Desenvolvimento Guiado por Testes (TDD) com Node.js e Vitest
**Tópicos:**
- Plataforma de Microlearning (Educação)
- Arquitetura Node.js com ESM (EcmaScript Modules)
- TDD com Vitest e Mock do Sequelize
- Organização em Padrão Modular

## SLIDE 2: Estrutura do Projeto e Responsabilidades
**Título:** Estrutura Modular da Aplicação
**Tópicos:**
- **Módulos Independentes:** Código dividido por domínios (User, Course, Lesson) para escalabilidade.
- **Isolamento de Testes:** Arquivos de testes localizados junto aos módulos (ex: `modules/user/__tests__`), facilitando a manutenção.
- **Separação de Camadas:** Routes, Controllers e Services garantindo a responsabilidade única exigida no MVC.

## SLIDE 3: O Módulo de Produção (User Service)
**Título:** A Camada de Serviços (User)
**Tópicos:**
- **Regras de Negócio Centralizadas:** O `userService.js` lida com a lógica crítica de Usuários sem se preocupar com Express ou HTTP.
- **Validações:** Impedimento de duplicidade de e-mails, bloqueio de autoexclusão.
- **Relacionamentos:** Associação N:N entre Usuários e Cursos através da tabela intermediária `UserCourse`.

**Bloco de Código:**
```javascript
async createUser(data, courseIds = []) {
  const { name, email, password, role, bio } = data;
  const existingUser = await User.findOne({ where: { email } });
  
  if (existingUser) {
    throw new UserServiceError('Este email ja esta cadastrado.');
  }

  const newUser = await User.create({ name, email, password, role, bio });
  // ... associação de cursos via bulkCreate
  return newUser;
}
```

## SLIDE 4: Ciclo TDD (Red-Green-Refactor)
**Título:** O Ciclo TDD na Prática
**Tópicos:**
- **Red:** Escrever o teste para uma validação inexistente (ex: deletar a própria conta). O teste falha.
- **Green:** Implementar a condicional simples (`if (editUser.id === currentUserId) throw Error`). O teste passa a ficar verde.
- **Refactor:** Limpar o código e otimizar as queries no Sequelize mantendo o teste passando (100% de cobertura no Service).

## SLIDE 5: Testes Unitários e Vitest Expect
**Título:** Validando Regras de Negócio com Vitest
**Tópicos:**
- **Isolamento Total:** O banco de dados não é sequer tocado durante o processo.
- **Uso do .rejects.toThrow:** Garante que a exceção customizada correta foi disparada na camada de Service.

**Bloco de Código:**
```javascript
it('deve lançar erro se o usuário tentar deletar a própria conta', async () => {
    // Simulando que o usuário alvo existe no banco
    const mockUser = { id: 1 };
    User.findByPk.mockResolvedValue(mockUser);

    // Id alvo: 1, Id de quem chamou a exclusão: 1
    await expect(userService.deleteUser(1, 1))
      .rejects
      .toThrow('Voce nao pode excluir sua propria conta.');
});
```
**Explicação Técnica:** 
O `expect` assíncrono aguarda a promessa do método `deleteUser`. Ao identificar que o ID de exclusão é o mesmo do usuário atual, a função dispara a exceção. O `.rejects.toThrow` captura essa exceção e valida se a mensagem de erro é exatamente a esperada pela regra de negócio.

## SLIDE 6: Testes Unitários e Mocking de Retorno
**Título:** Asserções de Criação e Formato
**Tópicos:**
- **Validação de Objetos:** Uso de `.toHaveProperty` para garantir o retorno correto da Service.
- **Garantia de Comportamento:** `.not.toHaveBeenCalled()` previne processamento fantasma ou inútil.

**Bloco de Código:**
```javascript
it('deve criar um usuário com sucesso sem cursos atrelados', async () => {
    User.findOne.mockResolvedValue(null); // E-mail liberado
    User.create.mockResolvedValue({ id: 1, name: 'João' });

    const result = await userService.createUser({ name: 'João', email: 'x@x.com' });
    
    expect(result).toHaveProperty('id', 1);
    expect(UserCourse.bulkCreate).not.toHaveBeenCalled();
});
```
**Explicação Técnica:** 
Usamos `.mockResolvedValue` para injetar o que a Model retornaria caso estivéssemos conectados ao banco. Após executar `createUser`, a asserção `toHaveProperty` avalia a estrutura da resposta. A checagem negativa `.not.toHaveBeenCalled()` afirma que a tabela associativa (`UserCourse`) foi poupada de uma query desnecessária, já que nenhum curso foi repassado.

## SLIDE 7: Mocking de Camada de Banco (vi.mock)
**Título:** Isolando a Aplicação com `vi.mock()`
**Tópicos:**
- **Ausência do Sequelize:** Substituímos as Models reais por Mocks interceptados pelo próprio Vitest.
- **Interceptação de Funções:** Usamos `.toHaveBeenCalledWith` para validar a query SQL hipotética em memória.

**Bloco de Código:**
```javascript
vi.mock('../../../models/index.js', () => ({
  User: { findByPk: vi.fn() },
  UserCourse: { bulkCreate: vi.fn(), destroy: vi.fn() }
}));

it('deve atualizar os cursos do usuário', async () => {
    // ... setup
    await userService.updateUser(1, { name: 'João' }, [3, 4]);

    expect(UserCourse.bulkCreate).toHaveBeenCalledWith([
      { userId: 1, courseId: 3 },
      { userId: 1, courseId: 4 }
    ]);
});
```
**Explicação Técnica:** 
O `vi.mock` intercepta a importação do arquivo das models de produção. Ao rodar `updateUser`, interceptamos a chamada do banco. O `.toHaveBeenCalledWith` checa em memória se a ORM teria recebido o array contendo o payload de inserção múltipla corretamente (bulk), provando que a lógica lida perfeitamente com N:N.

## SLIDE 8: Conclusão e Resultados de Cobertura
**Título:** Cobertura de Código e Estabilidade
**Tópicos:**
- **15 Testes Unitários:** Todos aprovados em menos de 30 milissegundos graças ao isolamento provido pelos Mocks.
- **100% de Cobertura:** A camada Service foi testada integralmente cobrindo ramificações condicionais (Branches), funções (Funcs) e declarações (Stmts).
- **V8 Coverage:** Geração do report integrado ao Vitest comprovando a robustez da bateria de testes e assegurando a Nota Máxima nas asserções.
