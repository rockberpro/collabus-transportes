<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Horários por Rota
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Consulte os horários disponíveis para cada rota
            </p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
            <USelect
              v-model="filters.state"
              :items="stateOptions"
              placeholder="Selecione o estado"
              disabled
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cidade</label>
            <USelect
              v-model="filters.city"
              :items="cityOptions"
              placeholder="Selecione a cidade"
              disabled
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código da rota</label>
            <UInput
              v-model="filters.code"
              icon="i-lucide-hash"
              placeholder="Ex: R-001"
            />
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <UButton
            icon="i-lucide-search"
            @click="search"
            class="flex-1 sm:flex-none"
          >
            Pesquisar
          </UButton>
          <UButton
            variant="ghost"
            icon="i-lucide-refresh-cw"
            @click="reset"
            class="flex-1 sm:flex-none"
          >
            Limpar
          </UButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && !schedules.length" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando horários...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
        <div class="flex">
          <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Lista de Horários - Desktop (tabela) -->
      <div v-else-if="schedules.length > 0" class="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <!-- Tabela para telas médias e grandes -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Código da Rota
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Origem
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destino
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Horários
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="schedule in schedules" 
                :key="schedule.id" 
                class="hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ schedule.routeCode }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ schedule.route?.origin || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ schedule.route?.destination || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatTimes(schedule.times) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards para mobile -->
        <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="schedule in schedules"
            :key="schedule.id"
            class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {{ schedule.routeCode }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ schedule.route?.origin || '-' }} → {{ schedule.route?.destination || '-' }}
                </p>
              </div>
            </div>
            
            <div class="space-y-1 mb-3 text-sm">
              <div class="flex items-start text-gray-600 dark:text-gray-400">
                <UIcon name="i-lucide-clock" class="mr-2 mt-0.5 shrink-0" />
                <span class="wrap-break-word">{{ formatTimes(schedule.times) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow p-12 text-center">
        <UIcon name="i-lucide-calendar-clock" class="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum horário encontrado
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Tente ajustar os filtros ou limpar a busca
        </p>
        <UButton
          icon="i-lucide-refresh-cw"
          @click="reset"
        >
          Limpar Filtros
        </UButton>
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
    if (!res.ok) {
      throw new Error(`Erro ao carregar rotas: ${res.statusText}`)
    }
    const json = await res.json()
    routes.value = json.data || []
    
    // Define valores padrão se disponíveis
    if (routes.value.length > 0 && !filters.value.state) {
      const first = routes.value[0]
      if (first) {
        filters.value.state = first.state || ''
        filters.value.city = first.city || ''
      }
    }
  } catch (err: unknown) {
    console.error('Erro ao carregar rotas:', err)
    error.value = 'Erro ao carregar rotas'
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
    if (!res.ok) {
      throw new Error(`Erro ao carregar horários: ${res.statusText}`)
    }
    const json = await res.json()
    schedules.value = json.data || []
  } catch (err: unknown) {
    error.value = (err as Error)?.message || 'Erro ao carregar horários'
    console.error('Erro ao carregar horários:', err)
  } finally {
    loading.value = false
  }
}

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // Aplica query params aos filtros antes de carregar
  const q = route.query || {}
  if (q.routeCode && typeof q.routeCode === 'string') filters.value.code = q.routeCode
  if (q.state && typeof q.state === 'string') filters.value.state = q.state
  if (q.city && typeof q.city === 'string') filters.value.city = q.city

  await loadRoutes()
  await loadSchedules()

  // Sincroniza URL se necessário
  const hasQuery = !!(q.routeCode || q.state || q.city)
  if (hasQuery) {
    const params: Record<string, string> = {}
    if (filters.value.code) params.code = filters.value.code
    if (filters.value.state) params.state = filters.value.state
    if (filters.value.city) params.city = filters.value.city
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

const stateOptions = computed(() => {
  if (states.value.length === 0) {
    return [{ label: 'Carregando...', value: '' }]
  }
  return states.value.map(s => ({ label: s, value: s }))
})

const cityOptions = computed(() => {
  if (cities.value.length === 0) {
    return [{ label: 'Carregando...', value: '' }]
  }
  return cities.value.map(c => ({ label: c, value: c }))
})

function search() { 
  loadSchedules() 
}

function reset() { 
  filters.value.code = ''
  loadSchedules() 
}

function formatTimes(times: string[] | string | null | undefined): string {
  if (!times) return '-'
  if (Array.isArray(times)) return times.join(', ')
  try { 
    return String(times) 
  } catch { 
    return '-'
  }
}
</script>
