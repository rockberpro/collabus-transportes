# Sistema de E-mail - Collabus Transportes

Este documento descreve como usar o sistema de e-mail refatorado do projeto.

## Arquitetura

O sistema foi reestruturado seguindo as melhores práticas:

### 1. **Templates de E-mail** (`/server/templates/`)
- Templates HTML separados e reutilizáveis
- Dados tipados com TypeScript
- Estilos inline para compatibilidade com clientes de e-mail
- Template base para consistência visual

### 2. **Serviço de E-mail** (`/server/services/email.ts`)
- Classe centralizada para todas as operações de e-mail
- Configuração centralizada
- Validação de configurações
- Métodos específicos para diferentes tipos de e-mail

### 3. **Configuração** (`/server/config/email.ts`)
- Configurações centralizadas
- Validação de variáveis de ambiente
- Fácil manutenção e alteração

## Como Usar

### Enviando E-mail de Ativação

```typescript
import { EmailService } from "../services/email";

const emailService = new EmailService();
await emailService.sendActivationEmail(
  "usuario@email.com", 
  "Nome do Usuário", 
  "token-de-ativacao"
);
```

### Enviando E-mail de Boas-vindas

```typescript
import { EmailService } from "../services/email";

const emailService = new EmailService();
await emailService.sendWelcomeEmail(
  "usuario@email.com", 
  "Nome do Usuário"
);
```

### Enviando E-mail de Redefinição de Senha

```typescript
import { EmailService } from "../services/email";

const emailService = new EmailService();
await emailService.sendPasswordResetEmail(
  "usuario@email.com", 
  "Nome do Usuário", 
  "token-de-reset"
);
```

### Enviando E-mail Personalizado

```typescript
import { EmailService } from "../services/email";

const emailService = new EmailService();
await emailService.sendEmail({
  to: "usuario@email.com",
  subject: "Assunto do E-mail",
  text: "Versão em texto",
  html: "<h1>Versão HTML</h1>"
});
```

## Templates Disponíveis

### 1. **Template de Ativação** (`activation-email.ts`)
- Usado no cadastro de usuários
- Inclui botão de ativação
- Link alternativo para casos onde o botão não funciona

### 2. **Template de Boas-vindas** (`welcome-email.ts`)
- Enviado após ativação da conta
- Lista funcionalidades disponíveis
- Tom amigável e acolhedor

### 3. **Template de Redefinição de Senha** (`password-reset-email.ts`)
- Para recuperação de senha
- Aviso sobre expiração do link
- Instruções de segurança

### 4. **Template Base** (`base-email.ts`)
- Template reutilizável para e-mails personalizados
- Estrutura consistente
- Suporte a botões, avisos e informações secundárias

## Variáveis de Ambiente Necessárias

```env
GMAIL_USER=seu-email@gmail.com
GMAIL_PASS=sua-senha-de-app
NUXT_PUBLIC_SITE_URL=https://seudominio.com
```

## Integração com APIs

### No endpoint de cadastro (`sign-up.post.ts`)

```typescript
// Após criar o usuário
const emailService = new EmailService();
await emailService.sendActivationEmail(body.email, body.name, activationToken);
```

### No endpoint de ativação (`activate.get.ts`)

```typescript
// Após ativar a conta
const emailService = new EmailService();
await emailService.sendWelcomeEmail(user.email, user.name);
```

## Vantagens da Nova Arquitetura

1. **Separação de Responsabilidades**: Templates, serviços e configurações separados
2. **Reutilização**: Templates podem ser reutilizados em diferentes contextos
3. **Manutenibilidade**: Fácil de manter e estender
4. **Tipagem**: TypeScript garante segurança de tipos
5. **Testabilidade**: Cada componente pode ser testado individualmente
6. **Configuração Centralizada**: Fácil de configurar e alterar
7. **Tratamento de Erros**: Melhor tratamento de erros e logs

## Sistema de Logging

O projeto agora inclui um sistema de logging profissional usando Winston:

### 📋 **Características**
- **Logs estruturados** em JSON para análise
- **Múltiplos transportes** (console + arquivos)
- **Rotação automática** de arquivos de log
- **Logs contextuais** para diferentes operações
- **Middleware automático** para requests HTTP
- **Configuração por ambiente**

### 📁 **Arquivos de Log**
- `/logs/all.log` - Todos os logs
- `/logs/error.log` - Apenas erros
- Console - Logs coloridos no desenvolvimento

### 🎯 **Níveis de Log**
- `error` - Erros críticos
- `warn` - Avisos e situações suspeitas  
- `info` - Informações gerais
- `http` - Requests HTTP
- `debug` - Informações detalhadas (desenvolvimento)

### 💡 **Como Usar**
```typescript
import { logger } from "../utils/logger";

// Logs básicos
logger.error("Erro crítico", { context: "dados" });
logger.warn("Situação suspeita");
logger.info("Operação realizada");

// Logs contextuais
logger.userAction("Login attempt", "user@email.com");
logger.emailAction("Email sent", "user@email.com", "Welcome");
logger.databaseAction("User created", "users");
logger.authAction("Authentication failed", "user@email.com");
```

### 📊 **Monitoramento**
```bash
# Ver logs em tempo real  
tail -f logs/all.log

# Buscar erros
grep "error" logs/all.log

# Logs de hoje
grep "$(date +%Y-%m-%d)" logs/all.log
```

Consulte `/server/utils/LOGGING.md` para documentação completa.

## Próximos Passos

- [ ] Adicionar templates para outros tipos de e-mail (notificações, relatórios, etc.)
- [ ] Implementar sistema de filas para e-mails em massa
- [ ] Adicionar suporte a anexos
- [ ] Implementar templates responsivos mais avançados
- [ ] Adicionar testes unitários para os serviços
- [ ] ✅ **Sistema de logging profissional implementado**
- [ ] Implementar alertas automáticos para erros críticos
- [ ] Adicionar dashboard de monitoramento de logs
