import { defineNuxtPlugin } from '#app'
import type { Pinia, PiniaPluginContext } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  // Access the pinia instance that @pinia/nuxt registers on nuxtApp
  const nuxtAny = nuxtApp as unknown as { $pinia?: Pinia }
  const pinia = nuxtAny.$pinia
  if (!pinia || typeof window === 'undefined') return

  // Use a Pinia plugin to persist only the `auth` store
  pinia.use((context: PiniaPluginContext) => {
    const { store } = context
    const key = `pinia_${store.$id}`

    // Only persist the auth store
    if (store.$id !== 'auth') return

    // Helper to revive dates we know exist in the store
    const reviveDates = (raw: unknown): unknown => {
      try {
        if (raw == null) return raw
        if (typeof raw !== 'object') return raw
        const obj = raw as Record<string, unknown>
        const user = obj.user as Record<string, unknown> | undefined
        if (user && typeof user.createdAt === 'string') {
          user.createdAt = new Date(user.createdAt)
        }
        return obj
      } catch {
        // ignore
        return raw
      }
    }

    // Restore state from localStorage (if present)
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        const revived = reviveDates(parsed) as Record<string, unknown>
        // use $patch with a state mutator typed as a generic record to avoid strict type errors
        store.$patch((state: Record<string, unknown>) => Object.assign(state, revived))
      }
    } catch {
      console.warn('[piniaPersist] failed to restore state for', store.$id)
    }

    // Subscribe to store changes and persist them
    store.$subscribe((mutation, state) => {
      try {
        // Clone state to avoid mutating it and convert Dates to ISO
        const copy = JSON.parse(
          JSON.stringify(state, (_k, v) => (v instanceof Date ? v.toISOString() : v))
        )
        localStorage.setItem(key, JSON.stringify(copy))
      } catch {
        console.warn('[piniaPersist] failed to persist state for', store.$id)
      }
    }, { detached: true })
  })
})
