import { ref } from 'vue'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

// Estado global de autenticação
const authState = ref<AuthState>({
  token: null,
  isAuthenticated: false
})

export const useAuth = () => {
  // Função para definir o token
  const setToken = (token: string) => {
    authState.value.token = token
    authState.value.isAuthenticated = true
    
    // Armazenar no localStorage para persistência
    if (process.client) {
      localStorage.setItem('auth_token', token)
    }
  }

  // Função para limpar o token
  const clearToken = () => {
    authState.value.token = null
    authState.value.isAuthenticated = false
    
    // Remover do localStorage
    if (process.client) {
      localStorage.removeItem('auth_token')
    }
  }

  // Função para restaurar o token do localStorage
  const restoreToken = () => {
    if (process.client) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        authState.value.token = token
        authState.value.isAuthenticated = true
      }
    }
  }

  // Função para obter o token atual
  const getToken = () => {
    return authState.value.token
  }

  // Função para verificar se está autenticado
  const isAuthenticated = computed(() => {
    return authState.value.isAuthenticated && authState.value.token !== null
  })

  // Função para obter headers de autorização
  const getAuthHeaders = () => {
    const token = getToken()
    if (!token) {
      throw new Error('Token de autorização não encontrado')
    }
    
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  // Inicializar na primeira execução
  if (process.client && authState.value.token === null) {
    restoreToken()
  }

  return {
    setToken,
    clearToken,
    restoreToken,
    getToken,
    isAuthenticated: readonly(isAuthenticated),
    getAuthHeaders
  }
}
