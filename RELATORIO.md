# Relatório de Desenvolvimento TDD (Nota 6)

## 1. Funcionalidade Escolhida e Regras de Negócio
A funcionalidade escolhida para cobertura de testes unitários foi a Gestão de Usuários (camada Service), implementada em `modules/user/userService.js`. Esta camada gerencia a comunicação da aplicação com as models `User`, `Course` e `UserCourse` (via Sequelize). 

Algumas regras de negócio garantidas pelo `userService` incluem:
- Não permitir que dois usuários possuam o mesmo e-mail (validação na criação).
- Atrelar dinamicamente os cursos a um novo usuário usando relacionamentos N:N (`bulkCreate` na model `UserCourse`).
- Impedir que um administrador exclua sua própria conta.
- Impedir a atualização ou exclusão de um usuário caso ele não exista no banco de dados.

## 2. Aplicação do TDD (Ciclo Red-Green-Refactor)
O desenvolvimento seguiu o ciclo Red-Green-Refactor, no qual as regras de negócio foram previamente pensadas e garantidas através de testes.

1. **Red**: Primeiramente, declaramos o teste (ex: tentar excluir a própria conta) sem implementar a trava na service. Executamos o teste e o mesmo falha, indicando o comportamento indesejado.
2. **Green**: Em seguida, adicionamos o código de validação simples na função `deleteUser` (ex: `if (editUser.id === currentUserId) throw new UserServiceError(...)`). O teste passa (fica verde).
3. **Refactor**: Por fim, reavaliamos o código escrito, verificamos a necessidade de otimizar a query e refatoramos para manter a legibilidade, garantindo que o teste permaneça verde.

A mesma abordagem foi utilizada para a criação de usuários (validação de e-mail), com a criação das rotinas de Mock via Vitest (`vi.mock` e `vi.fn()`) simulando os retornos do Sequelize.

## 3. Exemplos de Testes Unitários

Abaixo apresentamos três dos mais de 10 cenários desenvolvidos:

### Exemplo 1: Validação de e-mail único
Verificamos se a Service lança a exceção `UserServiceError` quando tentamos cadastrar um e-mail já existente no banco.
```javascript
it('deve lançar erro se o email já estiver cadastrado', async () => {
    // Simulando que o findOne do banco retornou um registro (e-mail já existe)
    User.findOne.mockResolvedValue({ id: 1, email: 'teste@teste.com' });

    await expect(userService.createUser({ email: 'teste@teste.com' }))
    .rejects
    .toThrow(UserServiceError);
    
    expect(User.findOne).toHaveBeenCalledTimes(1);
});
```

### Exemplo 2: Bloqueio de autoexclusão
Verificamos se a Service impede que um usuário consiga apagar seu próprio perfil, prevenindo acidentes.
```javascript
it('deve lançar erro se o usuário tentar deletar a própria conta', async () => {
    // Simulando que o usuário alvo existe no banco
    const mockUser = { id: 1 };
    User.findByPk.mockResolvedValue(mockUser);

    // Id do usuário alvo: 1, Id de quem chamou a exclusão: 1
    await expect(userService.deleteUser(1, 1)).rejects.toThrow('Voce nao pode excluir sua propria conta.');
});
```

### Exemplo 3: Criação em lote de relacionamentos (Cursos)
Verificamos que, quando passamos cursos na criação de um usuário, a Service chama o `UserCourse.bulkCreate` corretamente para montar o relacionamento N:N.
```javascript
it('deve criar um usuário e atrelar cursos usando bulkCreate', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 2, name: 'Maria' });

    // Criando Maria e passando os cursos IDs 1 e 2
    await userService.createUser({ name: 'Maria' }, [1, 2]);

    expect(UserCourse.bulkCreate).toHaveBeenCalledWith([
    { userId: 2, courseId: 1 },
    { userId: 2, courseId: 2 }
    ]);
});
```
