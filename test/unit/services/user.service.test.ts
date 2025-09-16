import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../../../server/services/user'
import { mockMongoClient, createTestUser, createTestSignUpData, mockObjectId } from '../utils/test-helpers'
import type { UserDocument, CreateUserDocument } from '../../../types/user'

// Mock do MongoDB
vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => mockMongoClient),
  ObjectId: vi.fn((id) => mockObjectId(id))
}))

// Mock do bcryptjs
const mockBcrypt = {
  hash: vi.fn(),
  compare: vi.fn()
}
vi.mock('bcryptjs', () => mockBcrypt)

// Mock do crypto
const mockCrypto = {
  randomUUID: vi.fn(() => 'mocked-uuid-123')
}
vi.mock('crypto', () => mockCrypto)

// Mock do createError (Nuxt utility)
const mockCreateError = vi.fn((error) => error)
vi.stubGlobal('createError', mockCreateError)

describe('UserService', () => {
  let userService: UserService
  let mockCollection: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup dos mocks do MongoDB
    mockCollection = {
      findOne: vi.fn(),
      find: vi.fn(() => ({ next: vi.fn() })),
      insertOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      aggregate: vi.fn(() => ({ next: vi.fn() }))
    }
    
    mockMongoClient.db.mockReturnValue({
      collection: vi.fn(() => mockCollection)
    })
    
    // Configurar variáveis de ambiente
    process.env.MONGODB_URI = 'mongodb://localhost:27017'
    process.env.MONGODB_DB_NAME = 'test-db'
    process.env.MONGODB_AUTH_SOURCE = 'admin'
    
    userService = new UserService()
  })

  describe('findUserByEmail', () => {
    it('should find user by email successfully', async () => {
      const testUser = createTestUser()
      mockCollection.findOne.mockResolvedValueOnce(testUser)

      const result = await userService.findUserByEmail('test@example.com')

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(result).toEqual(testUser)
    })

    it('should return null when user not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null)

      const result = await userService.findUserByEmail('notfound@example.com')

      expect(result).toBeNull()
    })

    it('should close connection after operation', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null)

      await userService.findUserByEmail('test@example.com')

      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })

  describe('findUserByToken', () => {
    it('should find user by activation token', async () => {
      const testUser = { ...createTestUser(), active: false }
      mockCollection.findOne.mockResolvedValueOnce(testUser)

      const result = await userService.findUserByToken('activation-token-123')

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        token: 'activation-token-123',
        active: false
      })
      expect(result).toEqual(testUser)
    })
  })

  describe('findUserById', () => {
    it('should find user by ObjectId', async () => {
      const testUser = createTestUser()
      const userId = '507f1f77bcf86cd799439011'
      mockCollection.findOne.mockResolvedValueOnce(testUser)

      const result = await userService.findUserById(userId)

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object) // ObjectId mock
      })
      expect(result).toEqual(testUser)
    })
  })

  describe('createUser', () => {
    it('should create user and return inserted ID', async () => {
      const userDocument: CreateUserDocument = {
        email: 'new@example.com',
        password: 'hashedpassword',
        type: 'passenger',
        createdAt: new Date(),
        active: false,
        token: 'activation-token'
      }
      
      const mockInsertResult = {
        insertedId: mockObjectId('507f1f77bcf86cd799439011')
      }
      mockCollection.insertOne.mockResolvedValueOnce(mockInsertResult)

      const result = await userService.createUser(userDocument)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(userDocument)
      expect(result).toBe('507f1f77bcf86cd799439011')
    })
  })

  describe('activateUser', () => {
    it('should activate user and remove token', async () => {
      const userId = mockObjectId('507f1f77bcf86cd799439011')

      await userService.activateUser(userId)

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        {
          $set: { active: true },
          $unset: { token: "" }
        }
      )
    })
  })

  describe('updateUser', () => {
    it('should update user with provided data', async () => {
      const userId = '507f1f77bcf86cd799439011'
      const updateData = { email: 'newemail@example.com' }

      await userService.updateUser(userId, updateData)

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { $set: updateData }
      )
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const testUser = { ...createTestUser(), active: true }
      mockCollection.findOne.mockResolvedValueOnce(testUser)
      mockBcrypt.compare.mockResolvedValueOnce(true)

      const result = await userService.authenticateUser('test@example.com', 'password123')

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', testUser.password)
      expect(result.id).toBe(testUser._id.toString())
      expect(result.email).toBe(testUser.email)
      expect(result.type).toBe(testUser.type)
      expect(result.createdAt).toBe(testUser.createdAt)
      expect(result.token).toBe(testUser.token)
    })

    it('should throw error for non-existent user', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null)

      await expect(
        userService.authenticateUser('notfound@example.com', 'password')
      ).rejects.toEqual({
        statusCode: 401,
        statusMessage: 'Email ou senha incorretos'
      })
    })

    it('should throw error for inactive account', async () => {
      const testUser = { ...createTestUser(), active: false }
      mockCollection.findOne.mockResolvedValueOnce(testUser)

      await expect(
        userService.authenticateUser('test@example.com', 'password')
      ).rejects.toEqual({
        statusCode: 403,
        statusMessage: 'Conta não ativada! Verifique seu email para ativar a conta.'
      })
    })

    it('should throw error for incorrect password', async () => {
      const testUser = { ...createTestUser(), active: true }
      mockCollection.findOne.mockResolvedValueOnce(testUser)
      mockBcrypt.compare.mockResolvedValueOnce(false)

      await expect(
        userService.authenticateUser('test@example.com', 'wrongpassword')
      ).rejects.toEqual({
        statusCode: 401,
        statusMessage: 'Email ou senha incorretos.'
      })
    })
  })

  describe('createUserWithPerson', () => {
    it('should create user and associated person successfully', async () => {
      const signUpData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123'
      }
      
      const mockUsersCollection = { ...mockCollection }
      const mockPersonsCollection = { ...mockCollection }
      
      // Mock para coleções diferentes
      mockMongoClient.db.mockReturnValue({
        collection: vi.fn((name: string) => {
          if (name === 'users') return mockUsersCollection
          if (name === 'persons') return mockPersonsCollection
          return mockCollection
        })
      })
      
      mockUsersCollection.findOne.mockResolvedValueOnce(null) // Usuário não existe
      mockUsersCollection.insertOne.mockResolvedValueOnce({
        insertedId: mockObjectId('507f1f77bcf86cd799439011')
      })
      mockPersonsCollection.insertOne.mockResolvedValueOnce({
        insertedId: mockObjectId('507f1f77bcf86cd799439022')
      })
      mockBcrypt.hash.mockResolvedValueOnce('hashedpassword123')

      const result = await userService.createUserWithPerson(signUpData)

      expect(mockUsersCollection.findOne).toHaveBeenCalledWith({ email: signUpData.email })
      expect(mockBcrypt.hash).toHaveBeenCalledWith(signUpData.password, 12)
      expect(mockUsersCollection.insertOne).toHaveBeenCalled()
      expect(mockPersonsCollection.insertOne).toHaveBeenCalled()
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('activationToken', 'mocked-uuid-123')
    })

    it('should throw error when user already exists', async () => {
      const signUpData = createTestSignUpData()
      const existingUser = createTestUser()
      mockCollection.findOne.mockResolvedValueOnce(existingUser)

      await expect(
        userService.createUserWithPerson(signUpData)
      ).rejects.toEqual({
        statusCode: 409,
        statusMessage: 'Usuário já existe com este email'
      })
    })
  })

  describe('connection management', () => {
    it('should handle connection errors properly', async () => {
      const connectionError = new Error('Connection failed')
      mockMongoClient.connect.mockRejectedValueOnce(connectionError)

      await expect(userService.findUserByEmail('test@example.com')).rejects.toThrow('Connection failed')
    })

    it('should always close connection even on error', async () => {
      const queryError = new Error('Query failed')
      mockCollection.findOne.mockRejectedValueOnce(queryError)

      await expect(userService.findUserByEmail('test@example.com')).rejects.toThrow('Query failed')
      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })
})