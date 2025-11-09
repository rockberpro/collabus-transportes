<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Consultar Rotas de Ônibus
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Encontre rotas disponíveis em Lajeado, RS
            </p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">De onde</label>
            <UInput
              v-model="filters.origin"
              icon="i-lucide-map-pin"
              placeholder="Digite ou escolha uma origem"
              list="origins"
            />
            <datalist id="origins">
              <option v-for="o in origins" :key="o" :value="o" />
            </datalist>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Para onde</label>
            <UInput
              v-model="filters.destination"
              icon="i-lucide-flag"
              placeholder="Digite ou escolha um destino"
              list="destinations"
            />
            <datalist id="destinations">
              <option v-for="d in destinations" :key="d" :value="d" />
            </datalist>
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
      <div v-if="loading && !routes.length" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando rotas...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
        <div class="flex">
          <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Lista de Rotas - Desktop (tabela) -->
      <div v-else-if="filteredRoutes.length > 0" class="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <!-- Tabela para telas médias e grandes -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Origem
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destino
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Localização
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="route in filteredRoutes" 
                :key="route.id" 
                class="hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
                @click="gotoSchedule(route)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ route.code || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.origin || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.destination || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.city || '-' }} - {{ route.state || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <UButton
                    icon="i-lucide-calendar"
                    size="sm"
                    color="primary"
                    variant="ghost"
                    @click.stop="gotoSchedule(route)"
                  >
                    Ver Horários
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards para mobile -->
        <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="route in filteredRoutes"
            :key="route.id"
            class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
            role="button"
            tabindex="0"
            @click="gotoSchedule(route)"
            @keydown.enter.prevent="gotoSchedule(route)"
            @keydown.space.prevent="gotoSchedule(route)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {{ route.code || 'Sem código' }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ route.origin || '-' }} → {{ route.destination || '-' }}
                </p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="text-gray-400 ml-2 shrink-0" />
            </div>
            
            <div class="space-y-1 mb-3 text-sm">
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <UIcon name="i-lucide-map-pin" class="mr-2 shrink-0" />
                <span class="truncate">{{ route.city || '-' }} - {{ route.state || '-' }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton
                icon="i-lucide-calendar"
                size="sm"
                color="primary"
                variant="ghost"
                class="w-full"
                @click.stop="gotoSchedule(route)"
              >
                Ver Horários
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow p-12 text-center">
        <UIcon name="i-lucide-route" class="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhuma rota encontrada
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
    if (!res.ok) {
      throw new Error(`Erro ao carregar rotas: ${res.statusText}`)
    }
    const json = await res.json()
    routes.value = json.data || []
  } catch (err: unknown) {
    error.value = (err as Error)?.message || 'Erro ao carregar rotas'
    console.error('Erro ao carregar rotas:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoutes()
})

const router = useRouter()

function gotoSchedule(r: RouteInfo) {
  router.push({ 
    path: '/schedules', 
    query: { 
      routeCode: String(r.code || ''), 
      state: String(r.state || ''), 
      city: String(r.city || '') 
    } 
  })
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

function search() { 
  // A filtragem é reativa via computed
  // Esta função pode ser expandida no futuro para busca no servidor
}

function reset() { 
  filters.value.origin = ''
  filters.value.destination = ''
}
</script>
