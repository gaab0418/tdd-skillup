# SkillUp - Context

## Decisões de Arquitetura

### MVC com Componentização EJS
Views organizadas em 4 níveis: layouts → partials → components → pages.
Components são reutilizáveis (cards, forms, ui) e recebem dados via variáveis EJS.

### Autenticação
- Senhas hasheadas com bcryptjs (salt rounds: 12) via Sequelize hooks
- Sessão gerenciada por express-session (cookie 24h)
- Flash messages via connect-flash para feedback ao usuário
- Middleware `attachUser` global que disponibiliza `res.locals.user`
- Middleware `isAuthenticated` e `isAdmin` para proteção de rotas

### Upload de Arquivos
- Multer com disk storage em `public/uploads/{videos,thumbnails,avatars}`
- Cada tipo tem limite de tamanho e filtro de mimetype
- Nomes únicos gerados com timestamp + random

### Database
- MySQL 8 via Docker Compose com volume persistente
- Sequelize 6 com sync:alter em desenvolvimento
- Modelos: User, Topic, Lesson, Progress, Certificate, Comment
- Associações definidas centralmente em `models/index.js`

### Design System
- TailwindCSS via CDN com config replicada do design.html
- Material Design 3 color palette
- Fontes: Inter (body/labels) + Lexend (headings/display)
- Ícones: Material Symbols Outlined + FontAwesome 6
- Shadows customizados: level-1 (4px blur) e level-2 (8px blur)

## Funcionalidades por Perfil

### Usuário
- Login/Registro com validação
- Browse de lições com filtro por tópico e busca
- Player de lição com vídeo + sidebar de currículo
- Progresso rastreado por lição
- Comentários em lições
- Perfil com estatísticas e certificados
- Configurações (avatar, dados, senha)

### Admin
- Dashboard com métricas (usuários, lições, completion rate)
- Gráfico de crescimento da plataforma
- Trending lessons e atividade recente
- Content Manager (CRUD de lições com upload)
- Analytics (placeholder para expansão futura)
