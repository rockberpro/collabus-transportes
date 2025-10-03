# Docker Configuration for Collabus Transportes

## Services

- **Nuxt**: localhost:3000 (Main application)
- **Redis**: localhost:6379 (Cache and sessions)
- **Database**: Supabase PostgreSQL (Cloud)

## Quick Start

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Database

Using **Supabase PostgreSQL** (cloud-hosted):
- Configured via environment variables
- Managed with Prisma ORM
- Migrations handled by `prisma migrate`

## Development Commands

```bash
# Start development environment
docker-compose up

# Access Nuxt container
docker-compose exec nuxt sh

# View Redis data
docker-compose exec redis redis-cli
```
