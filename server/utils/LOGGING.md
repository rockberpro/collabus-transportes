# Sistema de Logging

## Configuração

Para configurar o sistema de logging, adicione as seguintes variáveis de ambiente:

```env
# Configuração de Logging
NODE_ENV=development  # ou production
LOG_LEVEL=debug       # error, warn, info, http, debug
LOG_FILE_MAX_SIZE=5242880  # 5MB em bytes
LOG_FILE_MAX_FILES=5       # Número máximo de arquivos de log
```

## Estrutura dos Logs

### Diretórios
- `/logs/all.log` - Todos os logs
- `/logs/error.log` - Apenas erros
- Console - Logs coloridos no desenvolvimento

### Níveis de Log
- **error**: Erros críticos que precisam atenção imediata
- **warn**: Situações que podem ser problemáticas
- **info**: Informações gerais sobre operações
- **http**: Logs de requests HTTP
- **debug**: Informações detalhadas para desenvolvimento

### Formato dos Logs

#### Console (Desenvolvimento)
```
2025-09-11 10:30:45:123 info: [USER_ACTION] Sign-up attempt started
```

#### Arquivo (JSON)
```json
{
  "timestamp": "2025-09-11 10:30:45:123",
  "level": "info",
  "message": "[USER_ACTION] Sign-up attempt started",
  "meta": {
    "userId": "user123",
    "email": "user@example.com",
    "details": {}
  }
}
```

## Como Usar

### Importar o Logger
```typescript
import { logger } from "../utils/logger";
```

### Logs Básicos
```typescript
logger.error("Mensagem de erro", { adicionalInfo: "dados" });
logger.warn("Mensagem de aviso");
logger.info("Mensagem informativa");
logger.debug("Mensagem de debug");
```

### Logs Contextuais
```typescript
// Ações de usuário
logger.userAction("Sign-up attempt", "userId123", { email: "user@email.com" });

// Ações de e-mail
logger.emailAction("Email sent", "user@email.com", "Welcome Email");

// Ações de banco de dados
logger.databaseAction("User created", "usuarios", { userId: "123" });

// Ações de autenticação
logger.authAction("Login successful", "user@email.com", { userId: "123" });

// Logs de erro com contexto
logger.logError(error, "CONTEXT", { additional: "info" });

// Logs de request HTTP
logger.logRequest("POST", "/api/users", 201, 150);
```

## Middleware de Logging

O middleware `/server/middleware/logging.ts` automaticamente:
- Registra todas as requests da API
- Mede tempo de resposta
- Registra informações do cliente (IP, User-Agent)
- Faz log especial para erros HTTP

## Rotação de Logs

- Tamanho máximo por arquivo: 5MB
- Máximo de 5 arquivos mantidos
- Rotação automática quando limite é atingido
- Arquivos antigos são automaticamente removidos

## Monitoramento

### Comandos Úteis

```bash
# Visualizar logs em tempo real
tail -f logs/all.log

# Buscar por erros
grep "error" logs/all.log

# Buscar por usuário específico
grep "user@email.com" logs/all.log

# Ver apenas logs de hoje
grep "$(date +%Y-%m-%d)" logs/all.log
```

### Análise de Performance
```bash
# Requests mais lentas
grep "responseTime" logs/all.log | sort -k6 -n | tail -10

# Erros mais frequentes
grep '"level":"error"' logs/all.log | jq '.message' | sort | uniq -c | sort -nr
```

## Configuração para Produção

Em produção, recomenda-se:

1. **Usar LOG_LEVEL=warn** para reduzir volume
2. **Configurar logrotate** para arquivos antigos
3. **Monitorar espaço em disco** usado pelos logs
4. **Implementar alertas** para erros críticos
5. **Usar ferramentas** como ELK Stack ou Grafana para análise

### Exemplo logrotate (/etc/logrotate.d/collabus)
```
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    copytruncate
    notifempty
}
```
