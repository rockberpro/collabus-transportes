// Redirect users who already have a session to /home before rendering the page
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, ready, fetch } = useUserSession();
  const authStore = useAuthStore();

  // If Pinia already thinks we're authenticated, short-circuit
  if (authStore.isAuthenticated) {
    return navigateTo('/home');
  }

  // Try to restore persisted Pinia auth state from localStorage (client only)
  try {
    if (import.meta.client && typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('pinia_auth');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if ((parsed && parsed.user) || parsed.token) {
            authStore.setUser({
              user: parsed.user ?? null,
              token: parsed.token ?? null,
              tokenType: parsed.tokenType ?? null,
            });
            return navigateTo('/home');
          }
        } catch {
          // ignore JSON parse errors
        }
      }
    }
  } catch {
    // ignore localStorage access errors
  }

  // Ensure session is fetched (works on server and client)
  try {
    if (!ready.value && typeof fetch === 'function') {
      await fetch();
    }
  } catch {
    // ignore errors
  }

  if (loggedIn.value || authStore.isAuthenticated) {
    return navigateTo('/home');
  }
});
