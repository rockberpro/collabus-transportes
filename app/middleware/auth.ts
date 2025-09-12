export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated.value) {
    return navigateTo('/sign-in')
  }
})
