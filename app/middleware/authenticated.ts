export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();
  const authStore = useAuthStore();

  // Debug logging to help diagnose navigation issues on mobile
  try {
    console.debug('[middleware] authenticated - loggedIn:', loggedIn.value, 'authStore.isAuthenticated:', authStore.isAuthenticated, 'target:', to?.path || to);
  } catch (e) {
    // ignore logging errors in non-browser environments
  }

  const isAuthenticated = Boolean(loggedIn.value) || Boolean(authStore.isAuthenticated);

  if (!isAuthenticated) {
    // Log redirect
    try {
      console.debug('[middleware] redirecting to /sign-in from', to?.path || to);
    } catch (e) {}
    return navigateTo('/sign-in');
  }
});
