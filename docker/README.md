# Docker Setup para Collabus Transporte

Este diretório contém a configuração Docker para a aplicação Collabus Transporte.

## Como usar

### Executar da pasta docker

```bash
cd docker
docker-compose up -d
```

### Executar apenas o frontend (Nuxt)

```bash
cd docker
docker-compose up nuxt -d
```

### Executar com todos os serviços

```bash
cd docker
docker-compose up -d
```

## Serviços disponíveis

- **Nuxt**: http://localhost:3000 (Frontend + API)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Comandos úteis

```bash
# Ver logs
docker-compose logs -f nuxt

# Parar todos os serviços
docker-compose down

# Reconstruir imagens
docker-compose build --no-cache

# Executar comandos no container Nuxt
docker-compose exec nuxt npm run dev

# Executar comandos do Composer
docker-compose run --rm composer install

# Conectar ao MongoDB
docker-compose exec mongodb mongosh -u root -p mongodb

# Conectar ao MongoDB como usuário da aplicação
docker-compose exec mongodb mongosh -u collabus_user -p collabus_password collabus
```

## Configuração do MongoDB

### Credenciais:
- **Admin**: root / mongodb
- **Usuário da aplicação**: collabus_user / collabus_password
- **Database**: collabus

### String de conexão:
```
mongodb://collabus_user:collabus_password@localhost:27017/collabus
```
