export default defineNuxtPlugin(() => {
  if (process.client) {
    const { restoreToken } = useAuth()
    
    // Restaurar token do localStorage na inicialização da aplicação
    restoreToken()
  }
})
