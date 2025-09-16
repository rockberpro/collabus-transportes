import { vi } from 'vitest'

// Mock do localStorage para testes
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock do MongoDB Client
export const mockMongoClient = {
  connect: vi.fn(),
  close: vi.fn(),
  db: vi.fn(() => ({
    collection: vi.fn(() => ({
      findOne: vi.fn(),
      find: vi.fn(() => ({
        next: vi.fn(),
      })),
      insertOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      aggregate: vi.fn(() => ({
        next: vi.fn(),
      })),
    })),
  })),
}

// Mock do $fetch para testes de composables
export const mockFetch = vi.fn()

// Setup global para testes
export const setupTestEnvironment = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  // Mock process.client
  global.process = {
    ...global.process,
    client: true,
  }

  // Limpar todos os mocks
  vi.clearAllMocks()
}

// Helper para criar ObjectId mock
export const mockObjectId = (id: string = '507f1f77bcf86cd799439011') => {
  const objectId = {
    toString: () => id,
    _id: id,
    _bsontype: 'ObjectId',
    id: Buffer.from(id.slice(0, 24), 'hex'),
    toHexString: () => id,
    toJSON: () => id,
    equals: vi.fn(),
    getTimestamp: vi.fn(),
    inspect: vi.fn(),
  }
  return objectId as any
}

// Helper para criar dados de usuário de teste
export const createTestUser = () => ({
  _id: mockObjectId(),
  email: 'test@example.com',
  password: '$2b$12$hashedpassword',
  type: 'passenger' as const,
  createdAt: new Date('2025-01-01'),
  active: true,
  token: 'test-token-123',
})

// Helper para criar dados de pessoa de teste
export const createTestPerson = () => ({
  _id: mockObjectId('507f1f77bcf86cd799439022'),
  name: 'João Silva',
  userId: mockObjectId(),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
})

// Helper para criar dados de SignUp
export const createTestSignUpData = () => ({
  name: 'João Silva',
  email: 'joao@example.com',
  password: '123456',
  passwordConfirm: '123456',
})

// Helper para criar dados de SignIn
export const createTestSignInData = () => ({
  email: 'joao@example.com',
  password: '123456',
})