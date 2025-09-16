import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PersonService } from '../../../server/services/person'
import { mockMongoClient, createTestPerson, mockObjectId } from '../utils/test-helpers'
import type { PersonDocument, CreatePersonDocument } from '../../../types/person'

// Mock do MongoDB
vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => mockMongoClient),
  ObjectId: vi.fn((id) => mockObjectId(id))
}))

describe('PersonService', () => {
  let personService: PersonService
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
    
    personService = new PersonService()
  })

  describe('findPersonById', () => {
    it('should find person by ID successfully', async () => {
      const testPerson = createTestPerson()
      const personId = '507f1f77bcf86cd799439022'
      mockCollection.findOne.mockResolvedValueOnce(testPerson)

      const result = await personService.findPersonById(personId)

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object) // ObjectId mock
      })
      expect(result).toEqual(testPerson)
    })

    it('should return null when person not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null)

      const result = await personService.findPersonById('507f1f77bcf86cd799439022')

      expect(result).toBeNull()
    })

    it('should close connection after operation', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null)

      await personService.findPersonById('507f1f77bcf86cd799439022')

      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })

  describe('findPersonsByUserId', () => {
    it('should find person by user ID', async () => {
      const testPerson = createTestPerson()
      const userId = mockObjectId('507f1f77bcf86cd799439011')
      mockCollection.find.mockReturnValue({
        next: vi.fn().mockResolvedValueOnce(testPerson)
      })

      const result = await personService.findPersonsByUserId(userId)

      expect(mockCollection.find).toHaveBeenCalledWith({ userId })
      expect(result).toEqual(testPerson)
    })

    it('should return null when no person found for user', async () => {
      const userId = mockObjectId('507f1f77bcf86cd799439011')
      mockCollection.find.mockReturnValue({
        next: vi.fn().mockResolvedValueOnce(null)
      })

      const result = await personService.findPersonsByUserId(userId)

      expect(result).toBeNull()
    })
  })

  describe('findPersonByNameAndUserId', () => {
    it('should find person by name and user ID', async () => {
      const testPerson = createTestPerson()
      const name = 'João Silva'
      const userId = '507f1f77bcf86cd799439011'
      mockCollection.findOne.mockResolvedValueOnce(testPerson)

      const result = await personService.findPersonByNameAndUserId(name, userId)

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        name: name,
        userId: expect.any(Object) // ObjectId mock
      })
      expect(result).toEqual(testPerson)
    })

    it('should return null when person not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null)

      const result = await personService.findPersonByNameAndUserId('João', '507f1f77bcf86cd799439011')

      expect(result).toBeNull()
    })
  })

  describe('createPerson', () => {
    it('should create person and return inserted ID', async () => {
      const personDocument: CreatePersonDocument = {
        name: 'Maria Silva',
        userId: mockObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const mockInsertResult = {
        insertedId: mockObjectId('507f1f77bcf86cd799439022')
      }
      mockCollection.insertOne.mockResolvedValueOnce(mockInsertResult)

      const result = await personService.createPerson(personDocument)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(personDocument)
      expect(result).toBe('507f1f77bcf86cd799439022')
    })

    it('should handle insertion error', async () => {
      const personDocument: CreatePersonDocument = {
        name: 'Maria Silva',
        userId: mockObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date()
      }
      
      const insertionError = new Error('Insertion failed')
      mockCollection.insertOne.mockRejectedValueOnce(insertionError)

      await expect(personService.createPerson(personDocument)).rejects.toThrow('Insertion failed')
      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })

  describe('createPersonFromData', () => {
    it('should create person from data object', async () => {
      const personData = {
        name: 'Carlos Santos',
        userId: '507f1f77bcf86cd799439011'
      }
      
      const mockInsertResult = {
        insertedId: mockObjectId('507f1f77bcf86cd799439022')
      }
      mockCollection.insertOne.mockResolvedValueOnce(mockInsertResult)

      const result = await personService.createPersonFromData(personData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        name: personData.name,
        userId: expect.any(Object), // ObjectId mock
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
      
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439022',
        name: personData.name,
        userId: personData.userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('updatePerson', () => {
    it('should update person with provided data', async () => {
      const personId = '507f1f77bcf86cd799439022'
      const updateData = { name: 'João Santos Updated' }

      await personService.updatePerson(personId, updateData)

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { 
          $set: { 
            ...updateData, 
            updatedAt: expect.any(Date)
          } 
        }
      )
    })

    it('should handle update error', async () => {
      const personId = '507f1f77bcf86cd799439022'
      const updateData = { name: 'João Santos Updated' }
      const updateError = new Error('Update failed')
      
      mockCollection.updateOne.mockRejectedValueOnce(updateError)

      await expect(personService.updatePerson(personId, updateData)).rejects.toThrow('Update failed')
      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })

  describe('deletePerson', () => {
    it('should delete person by ID', async () => {
      const personId = '507f1f77bcf86cd799439022'
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 })

      await personService.deletePerson(personId)

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(Object) // ObjectId mock
      })
    })

    it('should handle deletion error', async () => {
      const personId = '507f1f77bcf86cd799439022'
      const deletionError = new Error('Deletion failed')
      
      mockCollection.deleteOne.mockRejectedValueOnce(deletionError)

      await expect(personService.deletePerson(personId)).rejects.toThrow('Deletion failed')
      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })

  describe('findPersonWithUser', () => {
    it('should find person with user data using aggregation', async () => {
      const personId = '507f1f77bcf86cd799439022'
      const mockResult = {
        _id: mockObjectId(personId),
        name: 'João Silva',
        userId: mockObjectId('507f1f77bcf86cd799439011'),
        user: {
          _id: mockObjectId('507f1f77bcf86cd799439011'),
          email: 'joao@example.com',
          type: 'passenger'
        }
      }
      
      mockCollection.aggregate.mockReturnValue({
        next: vi.fn().mockResolvedValueOnce(mockResult)
      })

      const result = await personService.findPersonWithUser(personId)

      expect(mockCollection.aggregate).toHaveBeenCalledWith([
        { $match: { _id: expect.any(Object) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" }
      ])
      expect(result).toEqual(mockResult)
    })

    it('should return null when person with user not found', async () => {
      const personId = '507f1f77bcf86cd799439022'
      
      mockCollection.aggregate.mockReturnValue({
        next: vi.fn().mockResolvedValueOnce(null)
      })

      const result = await personService.findPersonWithUser(personId)

      expect(result).toBeNull()
    })
  })

  describe('connection management', () => {
    it('should handle connection errors properly', async () => {
      const connectionError = new Error('Connection failed')
      mockMongoClient.connect.mockRejectedValueOnce(connectionError)

      await expect(personService.findPersonById('507f1f77bcf86cd799439022')).rejects.toThrow('Connection failed')
    })

    it('should always close connection even on query error', async () => {
      const queryError = new Error('Query failed')
      mockCollection.findOne.mockRejectedValueOnce(queryError)

      await expect(personService.findPersonById('507f1f77bcf86cd799439022')).rejects.toThrow('Query failed')
      expect(mockMongoClient.close).toHaveBeenCalled()
    })
  })

  describe('ObjectId handling', () => {
    it('should properly convert string IDs to ObjectId', async () => {
      const personId = '507f1f77bcf86cd799439022'
      mockCollection.findOne.mockResolvedValueOnce(null)

      await personService.findPersonById(personId)

      // Verificar se ObjectId foi chamado com o ID correto
      const { ObjectId } = await import('mongodb')
      expect(ObjectId).toHaveBeenCalledWith(personId)
    })

    it('should handle invalid ObjectId format gracefully', async () => {
      const invalidId = 'invalid-id-format'
      const error = new Error('Invalid ObjectId')
      
      // Mock ObjectId para lançar erro com ID inválido
      const { ObjectId } = await import('mongodb')
      vi.mocked(ObjectId).mockImplementationOnce(() => {
        throw error
      })

      await expect(personService.findPersonById(invalidId)).rejects.toThrow('Invalid ObjectId')
    })
  })
})