# SkillUp

## Sobre o Projeto

SkillUp é uma plataforma de microaprendizado desenvolvida como projeto de faculdade. Permite que usuários assistam lições curtas em vídeo, acompanhem progresso, ganhem certificados e interajam via comentários.

## Requisitos do Sistema

 --> [Clique Aqui](https://google.com.br) <--

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

Subir MySQL (opcional)
```bash
docker-compose up -d    
```

Iniciar Projeto
```bash
npm install             # Instalar dependências
npm run seed            # Popular banco com dados de teste
npm run dev             # Rodar em desenvolvimento (nodemon)
npm start               # Rodar em produção
```

## Credenciais de Teste

- **Admin**: admin@admin.com / admin123
- **User**: user@user.com / user123
