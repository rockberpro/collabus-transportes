import { describe, it, expect, vi } from 'vitest'
import { 
  mapUserDocumentToUser, 
  mapSignUpDataToUserDocument,
  type UserDocument,
  type SignUpData 
} from '../../../types/user'
import { createTestUser, createTestSignUpData, mockObjectId } from '../utils/test-helpers'

describe('User Types and Utilities', () => {
  describe('mapUserDocumentToUser', () => {
    it('should map UserDocument to User correctly', () => {
      const userDocument: UserDocument = {
        _id: mockObjectId('507f1f77bcf86cd799439011'),
        email: 'test@example.com',
        password: 'hashedpassword',
        type: 'passenger',
        createdAt: new Date('2025-01-01'),
        active: true,
        token: 'test-token-123'
      }

      const user = mapUserDocumentToUser(userDocument)

      expect(user).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        type: 'passenger',
        createdAt: new Date('2025-01-01'),
        token: 'test-token-123'
      })
    })

    it('should handle UserDocument without _id', () => {
      const userDocument: UserDocument = {
        email: 'test@example.com',
        password: 'hashedpassword',
        type: 'driver',
        createdAt: new Date('2025-01-01'),
        active: true,
        token: 'test-token-123'
      }

      const user = mapUserDocumentToUser(userDocument)

      expect(user.id).toBeUndefined()
      expect(user.email).toBe('test@example.com')
      expect(user.type).toBe('driver')
    })
  })

  describe('mapSignUpDataToUserDocument', () => {
    it('should create UserDocument with hashed password and token', async () => {
      const signUpData: SignUpData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456',
        passwordConfirm: '123456'
      }

      const userDocument = await mapSignUpDataToUserDocument(signUpData)

      expect(userDocument.email).toBe('joao@example.com')
      expect(userDocument.type).toBe('passenger')
      expect(userDocument.active).toBe(false)
      expect(userDocument.password).not.toBe('123456') // deve estar hasheada
      expect(userDocument.password).toMatch(/^\$2b\$12\$/) // formato bcrypt
      expect(userDocument.token).toBeTruthy()
      expect(typeof userDocument.token).toBe('string')
      expect(userDocument.createdAt).toBeInstanceOf(Date)
    })

    it('should generate different tokens for different users', async () => {
      const signUpData1 = createTestSignUpData()
      const signUpData2 = { ...createTestSignUpData(), email: 'outro@example.com' }

      const userDoc1 = await mapSignUpDataToUserDocument(signUpData1)
      const userDoc2 = await mapSignUpDataToUserDocument(signUpData2)

      expect(userDoc1.token).not.toBe(userDoc2.token)
    })

    it('should generate different hashed passwords for same password', async () => {
      const signUpData1 = createTestSignUpData()
      const signUpData2 = { ...createTestSignUpData(), email: 'outro@example.com' }

      const userDoc1 = await mapSignUpDataToUserDocument(signUpData1)
      const userDoc2 = await mapSignUpDataToUserDocument(signUpData2)

      // Mesmo tendo a mesma senha, os hashes devem ser diferentes (salt)
      expect(userDoc1.password).not.toBe(userDoc2.password)
    })
  })
})