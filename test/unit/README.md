# 🧪 Testes Unitários - Collabus Transportes

Este diretório contém os testes unitários para a aplicação Collabus Transportes.

## 📁 Estrutura dos Testes

```
test/unit/
├── setup.ts                  # Configuração global dos testes
├── utils/
│   └── test-helpers.ts       # Funções auxiliares e mocks
├── types/
│   └── user.test.ts          # Testes para tipos e utilitários
├── composables/
│   ├── useAuth.test.ts       # Testes para autenticação
│   └── useUsers.test.ts      # Testes para API de usuários
└── services/
    ├── user.service.test.ts  # Testes para serviço de usuários
    └── person.service.test.ts # Testes para serviço de pessoas
```

## 🚀 Executando os Testes

### Executar todos os testes
```bash
npm test
```

### Executar em modo watch (desenvolvimento)
```bash
npm run test:watch
```

### Executar com cobertura
```bash
npm run test:coverage
```

### Executar teste específico
```bash
npx vitest test/unit/composables/useAuth.test.ts
```

## 📋 Testes Implementados

### ✅ **Tipos e Utilitários** (`types/user.test.ts`)
- `mapUserDocumentToUser()` - Conversão de documento para interface
- `mapSignUpDataToUserDocument()` - Criação de documento com hash de senha
- Validação de estrutura dos tipos

### ✅ **Composable useAuth** (`composables/useAuth.test.ts`)
- `setToken()` - Salvar token e definir como autenticado
- `clearToken()` - Limpar token e estado de autenticação  
- `restoreToken()` - Restaurar do localStorage
- `getAuthHeaders()` - Retornar headers ou erro se não autenticado
- `isAuthenticated` computed - Refletir estado correto
- Integração com localStorage

### ✅ **Composable useUsers** (`composables/useUsers.test.ts`)
- `signUp()` - Requisição POST com dados corretos
- `signIn()` - Autenticação e retorno de usuário
- `findUserWithPerson()` - Buscar usuário com pessoa associada
- Tratamento de erros para cada método
- Mock do `$fetch` do Nuxt

### ✅ **UserService** (`services/user.service.test.ts`)
- `findUserByEmail()` - Encontrar usuário por email
- `findUserByToken()` - Encontrar usuário por token de ativação
- `createUser()` - Criar usuário no banco
- `activateUser()` - Ativar usuário e remover token
- `authenticateUser()` - Validar credenciais
- `createUserWithPerson()` - Criar usuário e pessoa associada
- Gerenciamento de conexões MongoDB
- Tratamento de erros

### ✅ **PersonService** (`services/person.service.test.ts`)
- `findPersonById()` - Encontrar pessoa por ID
- `findPersonsByUserId()` - Encontrar pessoas por usuário
- `createPerson()` - Criar nova pessoa
- `updatePerson()` - Atualizar dados da pessoa
- `deletePerson()` - Remover pessoa do banco
- `findPersonWithUser()` - Agregação com dados do usuário
- Validação de ObjectIds

## 🛠️ Mocks e Helpers

### **Mocks Disponíveis**
- `mockLocalStorage` - Mock do localStorage do navegador
- `mockMongoClient` - Mock do cliente MongoDB
- `mockFetch` - Mock do `$fetch` do Nuxt
- `mockObjectId()` - Helper para criar ObjectIds de teste
- `mockBcrypt` - Mock para hash de senhas
- `mockCrypto` - Mock para geração de UUIDs

### **Helpers de Dados**
- `createTestUser()` - Criar usuário de teste
- `createTestPerson()` - Criar pessoa de teste
- `createTestSignUpData()` - Dados de cadastro de teste
- `createTestSignInData()` - Dados de login de teste

## 🎯 Cobertura de Testes

Os testes cobrem:
- ✅ **Lógica de negócio** - Validações e transformações
- ✅ **Integração com MongoDB** - Operações de banco com mocks
- ✅ **Estado da aplicação** - Composables e gerenciamento
- ✅ **Tratamento de erros** - Cenários de falha e validações
- ✅ **Funções utilitárias** - Conversões e helpers
- ✅ **Autenticação** - Fluxo completo de auth
- ✅ **APIs** - Chamadas HTTP com mocks

## 📝 Convenções

### **Estrutura de Teste**
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange - preparar dados
      // Act - executar ação
      // Assert - verificar resultado
    })
  })
})
```

### **Nomenclatura**
- Arquivos: `*.test.ts` ou `*.spec.ts`
- Describes: Nome da classe/componente e método
- Its: Comportamento esperado em linguagem natural

### **Mocks**
- Sempre limpar mocks com `vi.clearAllMocks()` no `beforeEach`
- Usar mocks específicos para cada teste quando necessário
- Verificar chamadas com `expect().toHaveBeenCalledWith()`

## 🔧 Configuração

### **Vitest Config**
- Ambiente: `happy-dom` (para DOM APIs)
- Setup global em `test/unit/setup.ts`
- Suporte a TypeScript nativo

### **Variáveis de Ambiente**
Os testes usam variáveis de ambiente mockadas:
```typescript
process.env.MONGODB_URI = 'mongodb://localhost:27017'
process.env.MONGODB_DB_NAME = 'test-db'
process.env.MONGODB_AUTH_SOURCE = 'admin'
```