<template>
  <div>
    <!-- narrowed centered container for better readability on desktop -->
    <div class="max-w-3xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Horários por rota</h1>

      <div class="grid grid-cols-1 gap-4 mb-6">
        <!-- Top row: Estado and Cidade side-by-side on sm+ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Estado</label>
            <select v-model="filters.state" class="w-full p-2 border rounded" disabled>
              <option v-if="states.length === 0" value="" disabled>Carregando...</option>
              <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Cidade</label>
            <select v-model="filters.city" class="w-full p-2 border rounded" disabled>
              <option v-if="cities.length === 0" value="" disabled>Carregando...</option>
              <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <!-- Bottom row: Código da rota full width (narrow on sm+ via sm:w-80) -->
        <div>
          <label class="block text-sm font-medium mb-1">Código da rota</label>
          <input v-model="filters.code" class="w-full sm:w-80 p-2 border rounded" placeholder="Ex: R-001">
        </div>
      </div>

      <div class="mb-4">
        <button class="px-4 py-2 rounded" @click="search">Pesquisar</button>
        <button class="px-4 py-2 ml-2 border rounded" @click="reset">Limpar</button>
      </div>

      <!-- Use single-column list of cards so each block occupies the full row on desktop -->
      <div class="grid grid-cols-1 gap-4">
        <UCard v-if="schedules.length === 0" class="col-span-1 sm:col-span-2 text-center p-4">
          Nenhum horário encontrado
        </UCard>

        <UCard v-for="s in schedules" :key="s.id" class="p-4 w-full">
          <div class="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
            <div>
              <div class="text-lg font-semibold">{{ s.routeCode }}</div>
              <div class="text-md text-gray-500 dark:text-gray-400">{{ s.route?.origin || '-' }} → {{ s.route?.destination || '-' }}</div>
            </div>
            <div class="text-lg text-gray-700 dark:text-gray-200 text-right sm:text-right mt-2 sm:mt-0 whitespace-normal break-words">
              {{ formatTimes(s.times) }}
            </div>
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from '#app'

interface RouteInfo {
  id: string
  state?: string
  city?: string
  origin?: string
  destination?: string
}

interface ScheduleInfo {
  id: string
  routeCode: string
  route?: RouteInfo
  times?: string[] | string | null
}

const filters = ref({ state: '', city: '', code: '' })
const schedules = ref<Array<ScheduleInfo>>([])
const routes = ref<Array<RouteInfo>>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadRoutes() {
  try {
    const res = await fetch('/api/routes')
    const json = await res.json()
    routes.value = json.data || []
    // set defaults if present
    if (routes.value.length > 0 && !filters.value.state) {
      // pick the first state/city available (as before: RS / Lajeado)
      const first = routes.value[0]
      if (first) {
        filters.value.state = first.state || ''
        filters.value.city = first.city || ''
      }
    }
  } catch (err: unknown) {
    console.error(err)
  }
}

async function loadSchedules() {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    if (filters.value.state) params.set('state', filters.value.state)
    if (filters.value.city) params.set('city', filters.value.city)
    if (filters.value.code) params.set('code', filters.value.code)

    const res = await fetch(`/api/schedules?${params.toString()}`)
    const json = await res.json()
    schedules.value = json.data || []
  } catch (err: unknown) {
    error.value = (err as Error)?.message || String(err)
  } finally {
    loading.value = false
  }
}

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // se houver query params, aplicá-los aos filtros antes de carregar
  const q = route.query || {}
  if (q.routeCode && typeof q.routeCode === 'string') filters.value.code = q.routeCode
  if (q.state && typeof q.state === 'string') filters.value.state = q.state
  if (q.city && typeof q.city === 'string') filters.value.city = q.city

  await loadRoutes()
  await loadSchedules()

  // sincroniza URL se veio apenas routeCode (garante padrão de state/city no query)
  const hasQuery = !!(q.routeCode || q.state || q.city)
  if (hasQuery) {
    const params: Record<string, string> = {}
    if (filters.value.code) params.code = filters.value.code
    if (filters.value.state) params.state = filters.value.state
    if (filters.value.city) params.city = filters.value.city
    // evita reload completo, apenas atualiza a query
    router.replace({ path: route.path, query: params })
  }
})

const states = computed(() => {
  const set = new Set<string>()
  for (const r of routes.value) if (r.state) set.add(r.state)
  return Array.from(set).sort()
})

const cities = computed(() => {
  const set = new Set<string>()
  for (const r of routes.value) if (r.city) set.add(r.city)
  return Array.from(set).sort()
})

function search() { loadSchedules() }
function reset() { filters.value.code = '' ; loadSchedules() }

function formatTimes(times: string[] | string | null | undefined) {
  if (!times) return '-'
  if (Array.isArray(times)) return times.join(', ')
  try { return String(times) } catch { return String(times) }
}
</script>

<style scoped>
table th, table td { border-color: #e5e7eb; }
</style>
