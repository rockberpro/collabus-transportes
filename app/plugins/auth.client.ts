export default defineNuxtPlugin(() => {
  if (process.client) {
    const { restoreToken } = useAuth()
    restoreToken()
  }
})
