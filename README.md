# Tok&Stok — Sistema de Gestão de Estoque

Monorepo (frontend + backend) do sistema de controle de estoque industrial, seguindo a mesma
infraestrutura do projeto Veekar: **Nuxt 4 + Tailwind + Pinia** no front e **Laravel 12 + JWT +
PostgreSQL** no back, orquestrados via Docker Compose.

## Estrutura

```
frontend/   Nuxt 4 (app/pages, app/layouts, app/stores, app/composables) — design system "Industry"
backend/    Laravel 12 + tymon/jwt-auth — API REST em /api
docker-compose.yml, Makefile
```

## Status atual

- **Login**: funcional de ponta a ponta (Nuxt → API Laravel → JWT → PostgreSQL).
- **Dashboard, Produtos, Categorias, Fornecedores, Movimentações, Histórico, Relatórios**: telas
  completas no front, com dados em memória (mock) — CRUD ainda não persiste no backend. Serão
  ligadas à API nas próximas etapas.

## Como rodar

1. Subir backend + banco:
   ```bash
   docker compose up -d --build
   docker compose exec backend php artisan migrate --force
   docker compose exec backend php artisan db:seed --force
   ```
   (ou `make up`, `make migrate`, `make seed`)

2. Rodar o frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Acesse http://localhost:3000.

### Usuário de teste (seed)

- **E-mail:** operador@fabrica.com.br
- **Senha:** estoque123

## Design

Design system **Industry**: fundo claro, texto grafite, acento aço único, cartões "blueprint"
(cantos retos, marcas de registro `+`). Todos os tokens em `frontend/app/assets/css/industry.css`.
