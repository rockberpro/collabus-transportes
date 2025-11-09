<template>
  <div>
    <div class="max-w-3xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Consultar rotas de ônibus</h1>

      <!-- Filters: top row (Estado | Cidade), bottom row (De onde | Para onde) -->
      <div class="grid grid-cols-1 gap-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Estado</label>
            <select class="w-full p-2 border rounded" disabled>
              <option selected>RS</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Cidade</label>
            <select class="w-full p-2 border rounded" disabled>
              <option selected>Lajeado</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">De onde</label>
            <input v-model="filters.origin" list="origins" class="w-full p-2 border rounded" placeholder="Digite ou escolha uma origem">
            <datalist id="origins">
              <option v-for="o in origins" :key="o" :value="o" />
            </datalist>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Para onde</label>
            <input v-model="filters.destination" list="destinations" class="w-full p-2 border rounded" placeholder="Digite ou escolha um destino">
            <datalist id="destinations">
              <option v-for="d in destinations" :key="d" :value="d" />
            </datalist>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <button class="px-4 py-2 rounded" @click="search">Pesquisar</button>
        <button class="px-4 py-2 ml-2 border rounded" @click="reset">Limpar</button>
      </div>

      <!-- Cards: single-column list, each block occupies a full row -->
      <div class="grid grid-cols-1 gap-4">
        <UCard v-if="filteredRoutes.length === 0" class="text-center p-4">
          Nenhuma rota encontrada
        </UCard>

        <UCard
          v-for="route in filteredRoutes"
          :key="route.id"
          class="p-4 w-full cursor-pointer"
          role="button"
          tabindex="0"
          @click="gotoSchedule(route)"
          @keydown.enter.prevent="gotoSchedule(route)"
          @keydown.space.prevent="gotoSchedule(route)"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div class="text-lg font-semibold">
                <span v-if="route.code">{{ route.code }}</span>
                <span v-else>-</span>
              </div>
              <div class="text-md text-gray-500 dark:text-gray-400">{{ route.origin }} → {{ route.destination }}</div>
            </div>
            <div class="text-lg text-gray-700 dark:text-gray-200 mt-2 sm:mt-0 text-right">
              <div>{{ route.state }}</div>
              <div class="text-xs text-gray-500">{{ route.city }}</div>
            </div>
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface RouteInfo {
  id: string
  code?: string | null
  origin?: string | null
  destination?: string | null
  state?: string | null
  city?: string | null
}

const filters = ref({ origin: '', destination: '' })

const routes = ref<Array<RouteInfo>>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadRoutes() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/routes')
    const json = await res.json()
    routes.value = json.data || []
  } catch (err: unknown) {
    error.value = (err as Error)?.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoutes()
})

const router = useRouter()

function gotoSchedule(r: RouteInfo) {
  router.push({ path: '/schedules', query: { routeCode: String(r.code || ''), state: String(r.state || ''), city: String(r.city || '') } })
}

const filteredRoutes = computed(() => {
  return routes.value.filter((r: RouteInfo) => {
    const originMatch = !filters.value.origin || (r.origin || '').toLowerCase().includes(filters.value.origin.toLowerCase())
    const destMatch = !filters.value.destination || (r.destination || '').toLowerCase().includes(filters.value.destination.toLowerCase())
    return originMatch && destMatch
  })
})

const origins = computed(() => {
  const set = new Set<string>()
  for (const r of routes.value) if (r.origin) set.add(r.origin)
  return Array.from(set).sort()
})

const destinations = computed(() => {
  const set = new Set<string>()
  for (const r of routes.value) if (r.destination) set.add(r.destination)
  return Array.from(set).sort()
})

function search() { /* reactive via computed */ }
function reset() { filters.value.origin = ''; filters.value.destination = '' }
</script>

<style scoped>
/* small visual tweak retained */
table th, table td { border-color: #e5e7eb; }
</style>
