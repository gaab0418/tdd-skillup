# SkillUp - Agent Context

## Sobre o Projeto

SkillUp é uma plataforma de microaprendizado desenvolvida como projeto de faculdade. Permite que usuários assistam lições curtas em vídeo, acompanhem progresso, ganhem certificados e interajam via comentários.

## Stack

- **Backend**: Express.js 4.x + EJS + express-ejs-layouts
- **Database**: MySQL 8.0 (Docker) + Sequelize 6
- **Auth**: bcryptjs + express-session + connect-flash
- **Upload**: Multer (armazenamento local)
- **Frontend**: TailwindCSS (CDN) + Material Symbols + FontAwesome
- **Fontes**: Inter (body) + Lexend (headings)

## Estrutura MVC

- `models/` - Sequelize models (User, Topic, Lesson, Progress, Certificate, Comment)
- `controllers/` - Lógica de negócio por domínio
- `routes/` - Definição de rotas Express
- `views/` - Templates EJS organizados em layouts, partials, components e pages
- `middlewares/` - Auth, upload, flash
- `config/` - Database e session

## Comandos Principais

```bash
docker-compose up -d    # Subir MySQL
npm install             # Instalar dependências
npm run seed            # Popular banco com dados de teste
npm run dev             # Rodar em desenvolvimento (nodemon)
npm start               # Rodar em produção
```

## Credenciais de Teste

- **Admin**: admin@admin.com / admin123
- **User**: john@example.com / user123

## Design System

O design segue o padrão Material Design 3 com paleta customizada definida no TailwindCSS config.
Cores principais: primary (#0050cb), secondary (#006c4f), tertiary (#a33200).
