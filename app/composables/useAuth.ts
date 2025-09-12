import { ref } from 'vue'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

const authState = ref<AuthState>({
  token: null,
  isAuthenticated: false
})

export const useAuth = () => {
  const setToken = (token: string) => {
    authState.value.token = token
    authState.value.isAuthenticated = true
    
    if (process.client) {
      localStorage.setItem('auth_token', token)
    }
  }
  const clearToken = () => {
    authState.value.token = null
    authState.value.isAuthenticated = false
    
    if (process.client) {
      localStorage.removeItem('auth_token')
    }
  }
  const restoreToken = () => {
    if (process.client) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        authState.value.token = token
        authState.value.isAuthenticated = true
      }
    }
  }

  const getToken = () => {
    return authState.value.token
  }
  const isAuthenticated = computed(() => {
    return authState.value.isAuthenticated && authState.value.token !== null
  })
  const getAuthHeaders = () => {
    const token = getToken()
    if (!token) {
      throw new Error('Token de autorização não encontrado')
    }
    
    return {
      'Authorization': `Bearer ${token}`
    }
  }

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
