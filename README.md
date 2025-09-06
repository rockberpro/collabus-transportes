# Collabus Transporte

Sistema de transporte colaborativo desenvolvido com Nuxt 3 e MongoDB.

## 🚀 Setup

### 1. Configurar variáveis de ambiente

```bash
# Copiar os arquivos de exemplo
cp .env.example .env
cp docker/.env.example docker/.env

# Editar com suas configurações
nano .env
nano docker/.env
```

### 2. Instalar dependências

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 3. Iniciar com Docker

```bash
cd docker
docker compose up -d
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
