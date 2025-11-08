export default defineNuxtPlugin(() => {
  // Configure global fetch defaults for client-side
  const config = useRuntimeConfig()
  
  // Ensure all API requests include credentials (cookies)
  globalThis.$fetch = $fetch.create({
    credentials: 'include',
    onRequest({ options }) {
      // Ensure credentials are always included
      options.credentials = 'include'
    },
  })
})
