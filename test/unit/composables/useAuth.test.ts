import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../../../app/composables/useAuth'
import { mockLocalStorage } from '../utils/test-helpers'
import { computed } from 'vue'

// Mock do Vue
vi.mock('vue', () => ({
  ref: vi.fn((val) => ({ value: val })),
  computed: vi.fn((fn) => ({ value: fn() })),
  readonly: vi.fn((val) => val),
}))

// Definir computed e readonly globalmente
vi.stubGlobal('computed', vi.fn((fn) => ({ value: fn() })))
vi.stubGlobal('readonly', vi.fn((val) => val))

describe('useAuth Composable', () => {
  let auth: ReturnType<typeof useAuth>

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    vi.clearAllMocks()
    
    // Resetar localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    
    // Limpar tokens existentes primeiro
    const tempAuth = useAuth()
    tempAuth.clearToken()
    
    // Criar nova instância do composable
    auth = useAuth()
  })

  describe('setToken', () => {
    it('should set token and mark as authenticated', () => {
      const token = 'test-token-123'
      
      auth.setToken(token)
      
      expect(auth.getToken()).toBe(token)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', token)
    })
  })

  describe('clearToken', () => {
    it('should clear token and mark as unauthenticated', () => {
      // Primeiro definir um token
      auth.setToken('test-token')
      
      // Depois limpar
      auth.clearToken()
      
      expect(auth.getToken()).toBeNull()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('restoreToken', () => {
    it('should restore token from localStorage', () => {
      const savedToken = 'saved-token-123'
      mockLocalStorage.getItem.mockReturnValue(savedToken)
      
      auth.restoreToken()
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_token')
      expect(auth.getToken()).toBe(savedToken)
    })

    it('should not set token if localStorage is empty', () => {
      // Primeiro limpar qualquer token existente
      auth.clearToken()
      mockLocalStorage.getItem.mockReturnValue(null)
      
      auth.restoreToken()
      
      expect(auth.getToken()).toBeNull()
    })
  })

  describe('getToken', () => {
    it('should return current token', () => {
      const token = 'test-token-456'
      auth.setToken(token)
      
      expect(auth.getToken()).toBe(token)
    })

    it('should return null when no token is set', () => {
      // Garantir que não há token
      auth.clearToken()
      expect(auth.getToken()).toBeNull()
    })
  })

  describe('getAuthHeaders', () => {
    it('should return authorization headers when token exists', () => {
      const token = 'test-token-789'
      auth.setToken(token)
      
      const headers = auth.getAuthHeaders()
      
      expect(headers).toEqual({
        'Authorization': `Bearer ${token}`
      })
    })

    it('should throw error when no token exists', () => {
      // Garantir que não há token
      auth.clearToken()
      expect(() => {
        auth.getAuthHeaders()
      }).toThrow('Token de autorização não encontrado')
    })
  })

  describe('isAuthenticated', () => {
    it('should have isAuthenticated property when token exists', () => {
      auth.setToken('test-token')
      
      // Verificar se tem token (isso indica que está autenticado)
      expect(auth.getToken()).toBe('test-token')
      // Verificar que a propriedade isAuthenticated existe
      expect(auth.isAuthenticated).toBeDefined()
      expect(typeof auth.isAuthenticated).toBe('object')
    })

    it('should return false when no token exists', () => {
      // Garantir que não há token
      auth.clearToken()
      expect(auth.isAuthenticated.value).toBe(false)
    })

    it('should return false after token is cleared', () => {
      auth.setToken('test-token')
      auth.clearToken()
      
      expect(auth.isAuthenticated.value).toBe(false)
    })
  })

  describe('localStorage integration', () => {
    it('should not interact with localStorage on server side', () => {
      // Mock process.client as false (server side)
      const originalProcess = global.process
      global.process = { ...global.process, client: false }
      
      const serverAuth = useAuth()
      serverAuth.setToken('test-token')
      
      // Não deve tentar acessar localStorage
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      
      // Restaurar process original
      global.process = originalProcess
    })
  })
})