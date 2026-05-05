# SkillUp - Documento de Requisitos

Este documento descreve os requisitos funcionais (RF) e não funcionais (RNF) da plataforma de microaprendizado SkillUp, baseando-se na arquitetura MVC, stack Node.js/Express e as necessidades de interação e gestão de conteúdo.

### Requisitos Funcionais (RF)
Os requisitos funcionais definem as ações que o sistema deve ser capaz de executar.
  1. RF-01 - Cadastro de Usuário: O sistema deve permitir que novos usuários criem contas fornecendo nome, e-mail e senha.
  2. RF-02 - Autenticação: O sistema deve permitir o login e logout de usuários e administradores utilizando e-mail e senha.
  3. RF-03 - Perfil de Usuário: O sistema deve permitir que o usuário edite suas informações de perfil e altere sua foto de avatar.
  4. RF-04 - Exploração de Cursos: O sistema deve listar cursos e tópicos disponíveis para que o usuário possa navegar e escolher o que estudar.
  5. RF-05 - Player de Vídeo: O sistema deve possuir um player para exibição de lições em vídeo (formato .mp4).
  6. RF-06 - Marcação de Progresso: O sistema deve permitir que o usuário marque lições como "concluídas" para salvar seu progresso.
  7. RF-07 - Sistema de Comentários: O usuário deve poder postar comentários em lições específicas.
  8. RF-08 - Respostas e Curtidas: O sistema deve permitir que usuários respondam a comentários existentes e "curtam" comentários ou lições.
  9. RF-09 - Prova Final: Ao finalizar as lições de um tópico/curso, o sistema deve liberar uma prova de avaliação obrigatória.
  10. RF-10 - Emissão de Certificado: O sistema deve gerar um certificado de conclusão (PDF ou visual) caso o usuário seja aprovado na prova final.
  11. RF-11 - Gestão de Conteúdo (Admin): O administrador deve poder criar, ler, atualizar e deletar (CRUD) cursos, tópicos e lições.
  12. RF-12 - Gestão de Usuários (Admin): O administrador deve poder visualizar a lista de usuários, editar permissões (tornar admin) ou remover contas.
  13. RF-13 - Moderação de Comentários (Admin): O administrador deve ter poder para remover comentários inadequados da plataforma.
  14. RF-14 - Dashboard de Estatísticas (Admin): O sistema deve exibir um painel com métricas de uso, como total de usuários, lições assistidas e certificados emitidos.
  15. RF-15 - Busca Global: O sistema deve permitir a busca de lições ou tópicos por palavras-chave através de uma barra de pesquisa.
  16. RF-16 - Avaliação de Curso: O usuário deve poder atribuir uma nota de 1 a 5 estrelas e deixar um breve feedback sobre a qualidade do conteúdo.
  17. RF-17 - Gamificação (Medalhas): O sistema deve conceder medalhas virtuais ao usuário por marcos alcançados, como "Primeira Lição Concluída" ou "100% de Aproveitamento em Provas".
  18. RF-18 - Gestão de Categorias (Admin): O administrador deve poder gerenciar as categorias (tags) que organizam os cursos na plataforma.
  19. RF-19 - Modo de Visualização (Tema): O usuário deve poder alternar entre o tema claro e escuro (Dark Mode) na interface.
  20. RF-20 - Perfil do Instrutor: O sistema deve exibir informações sobre o autor do curso, incluindo bio e foto, nas páginas de detalhes do curso.
  21. RF-21 - Sistema de Pontuação (XP): O usuário deve acumular pontos de experiência (XP) ao assistir vídeos e interagir com comentários na plataforma.

### 2. Requisitos Não Funcionais (RNF)
Os requisitos não funcionais definem critérios de qualidade e restrições do sistema.

  1. RNF-01 - Segurança (Criptografia): Todas as senhas de usuários devem ser armazenadas no banco de dados utilizando hash bcryptjs.
  2. RNF-02 - Persistência de Dados: O sistema deve utilizar o banco de dados MySQL 8.0 para armazenamento persistente através do ORM Sequelize.
  3. RNF-03 - Responsividade: A interface deve ser responsiva, adaptando-se a dispositivos móveis e desktops, utilizando TailwindCSS.
  4. RNF-04 - Restrição de Formato de Vídeo: O sistema deve aceitar apenas uploads de arquivos de vídeo no formato .mp4.
  5. RNF-05 - Limite de Upload: O tamanho máximo permitido para o upload de vídeos deve ser de 100MB (limitado via middleware Multer).
  6. RNF-06 - Design System: A interface deve seguir o padrão Material Design 3, utilizando as cores primária (#0050cb), secundária (#006c4f) e terciária (#a33200).
  7. RNF-07 - Gerenciamento de Sessão: O sistema deve manter sessões de usuário seguras utilizando express-session.
  8. RNF-08 - Feedback ao Usuário: O sistema deve exibir mensagens de sucesso ou erro (Flash Messages) para cada ação importante realizada.
  9. RNF-09 - Disponibilidade (Docker): O ambiente de banco de dados deve ser facilmente replicável e isolado utilizando Docker Compose.
  10. RNF-10 - Organização de Código: O projeto deve seguir rigorosamente o padrão de arquitetura MVC (Models, Views, Controllers).
  11. RNF-11 - Desempenho de Carregamento: As páginas do frontend (EJS) devem carregar de forma eficiente, minimizando o uso de scripts externos pesados.
  12. RNF-12 - Tipografia: O sistema deve utilizar as fontes 'Lexend' para títulos e 'Inter' para o corpo do texto para garantir legibilidade.
  13. RNF-13 - Integridade Referencial: O banco de dados deve garantir que a exclusão de um curso remova em cascata (ou trate adequadamente) seus tópicos e lições relacionados.
  14. RNF-14 - Armazenamento de Arquivos: Os uploads de mídia (vídeos e imagens) devem ser armazenados localmente na pasta public/uploads de forma organizada.
  15. RNF-15 - Facilidade de Manutenção: O código deve ser documentado e utilizar rotas modulares para facilitar a expansão futura da plataforma.
  16. RNF-16 - Registro de Logs: O sistema deve utilizar uma biblioteca de logging (como `morgan` ou `winston`) para registrar erros e atividades críticas do servidor.
  17. RNF-17 - Proteção contra Força Bruta: O sistema deve implementar um limitador de requisições (`rate-limit`) nas rotas de login para evitar ataques de força bruta.
  18. RNF-18 - Isolamento de Variáveis: Todas as chaves de API e segredos de sessão devem ser armazenados exclusivamente em arquivos `.env`, nunca fixos no código.
  19. RNF-19 - Cache de Assets: O sistema deve configurar cabeçalhos de cache estático para que o navegador não precise baixar imagens e CSS repetidamente.
  20. RNF-20 - Backup Automatizado: O ambiente Docker deve possuir um volume ou script configurado para realizar backups periódicos do banco de dados MySQL.
