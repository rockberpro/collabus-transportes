import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUsers } from '../../../app/composables/useUsers'
import { createTestSignUpData, createTestSignInData, createTestUser } from '../utils/test-helpers'
import type { User } from '../../../types/user'

// Mock do $fetch global do Nuxt
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useUsers Composable', () => {
  let users: ReturnType<typeof useUsers>

  beforeEach(() => {
    vi.clearAllMocks()
    users = useUsers()
  })

  describe('signUp', () => {
    it('should call API with correct data and return response', async () => {
      const signUpData = createTestSignUpData()
      const mockResponse = {
        success: true,
        user: {
          id: '507f1f77bcf86cd799439011',
          email: signUpData.email,
          type: 'passenger' as const,
          createdAt: new Date('2025-01-01'),
          token: 'activation-token-123'
        }
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await users.signUp(signUpData)

      expect(mockFetch).toHaveBeenCalledWith('/api/user/sign-up', {
        method: 'POST',
        body: signUpData,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when API call fails', async () => {
      const signUpData = createTestSignUpData()
      const error = new Error('Email já existe')
      
      mockFetch.mockRejectedValueOnce(error)

      await expect(users.signUp(signUpData)).rejects.toThrow('Email já existe')
    })

    it('should handle API error responses correctly', async () => {
      const signUpData = createTestSignUpData()
      const apiError = {
        statusCode: 409,
        statusMessage: 'Usuário já existe com este email'
      }
      
      mockFetch.mockRejectedValueOnce(apiError)

      await expect(users.signUp(signUpData)).rejects.toEqual(apiError)
    })
  })

  describe('signIn', () => {
    it('should call API with correct credentials and return user', async () => {
      const signInData = createTestSignInData()
      const mockUser = createTestUser()
      const mockResponse = {
        success: true,
        user: {
          id: mockUser._id.toString(),
          email: mockUser.email,
          type: mockUser.type,
          createdAt: mockUser.createdAt,
          token: mockUser.token
        }
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await users.signIn(signInData)

      expect(mockFetch).toHaveBeenCalledWith('/api/user/sign-in', {
        method: 'POST',
        body: signInData,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error for invalid credentials', async () => {
      const signInData = createTestSignInData()
      const error = {
        statusCode: 401,
        statusMessage: 'Email ou senha incorretos'
      }
      
      mockFetch.mockRejectedValueOnce(error)

      await expect(users.signIn(signInData)).rejects.toEqual(error)
    })

    it('should handle inactive account error', async () => {
      const signInData = createTestSignInData()
      const error = {
        statusCode: 403,
        statusMessage: 'Conta não ativada! Verifique seu email para ativar a conta.'
      }
      
      mockFetch.mockRejectedValueOnce(error)

      await expect(users.signIn(signInData)).rejects.toEqual(error)
    })
  })

  describe('findUserWithPerson', () => {
    it('should fetch user with person data successfully', async () => {
      const userId = '507f1f77bcf86cd799439011'
      const mockUser: User = {
        id: userId,
        email: 'joao@example.com',
        type: 'passenger',
        createdAt: new Date('2025-01-01'),
        token: 'user-token-123'
      }
      const mockResponse = { user: mockUser }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await users.findUserWithPerson(userId)

      expect(mockFetch).toHaveBeenCalledWith(`/api/user/${userId}/person`, {
        method: 'GET',
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439011'
      const mockResponse = { user: null }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await users.findUserWithPerson(userId)

      expect(result).toBeNull()
    })

    it('should return null when response has no user property', async () => {
      const userId = '507f1f77bcf86cd799439011'
      const mockResponse = {}

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await users.findUserWithPerson(userId)

      expect(result).toBeNull()
    })

    it('should throw error when API call fails', async () => {
      const userId = '507f1f77bcf86cd799439011'
      const error = {
        statusCode: 404,
        statusMessage: 'Usuário não encontrado'
      }
      
      mockFetch.mockRejectedValueOnce(error)

      await expect(users.findUserWithPerson(userId)).rejects.toEqual(error)
    })

    it('should handle invalid userId format', async () => {
      const invalidUserId = 'invalid-id'
      const error = {
        statusCode: 400,
        statusMessage: 'ID de usuário inválido'
      }
      
      mockFetch.mockRejectedValueOnce(error)

      await expect(users.findUserWithPerson(invalidUserId)).rejects.toEqual(error)
    })
  })

  describe('error handling', () => {
    it('should preserve error structure for all methods', async () => {
      const originalError = {
        statusCode: 500,
        statusMessage: 'Erro interno do servidor',
        data: { details: 'Conexão com banco falhou' }
      }

      // Test signUp error preservation
      mockFetch.mockRejectedValueOnce(originalError)
      await expect(users.signUp(createTestSignUpData())).rejects.toEqual(originalError)

      // Test signIn error preservation
      mockFetch.mockRejectedValueOnce(originalError)
      await expect(users.signIn(createTestSignInData())).rejects.toEqual(originalError)

      // Test findUserWithPerson error preservation
      mockFetch.mockRejectedValueOnce(originalError)
      await expect(users.findUserWithPerson('123')).rejects.toEqual(originalError)
    })
  })
})