<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Minhas Designações
          </h1>
          <p v-if="companyName" class="mt-1 md:mt-2 text-base md:text-lg font-medium text-primary-600 dark:text-primary-400">
            {{ companyName }}
          </p>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Visualize os horários e veículos designados para você
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              @click="activeTab = 0"
              :class="[
                activeTab === 0
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              <UIcon 
                name="i-lucide-clock" 
                :class="[
                  activeTab === 0 ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                  'mr-2 h-5 w-5'
                ]"
              />
              Horários
            </button>
            <button
              @click="activeTab = 1"
              :class="[
                activeTab === 1
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              <UIcon 
                name="i-lucide-car" 
                :class="[
                  activeTab === 1 ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                  'mr-2 h-5 w-5'
                ]"
              />
              Veículos
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab: Horários -->
      <div v-show="activeTab === 0">
        <!-- Filtros de Horários -->
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div class="md:col-span-2">
              <UInput
                v-model="schedulesFilters.search"
                icon="i-lucide-search"
                placeholder="Buscar por código, origem ou destino..."
                @input="debouncedSchedulesSearch"
              />
            </div>
            <div class="flex justify-start md:justify-end">
              <UButton
                variant="ghost"
                icon="i-lucide-refresh-cw"
                class="w-full md:w-auto"
                @click="resetSchedulesFilters"
              >
                Limpar Filtros
              </UButton>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="schedulesLoading && !schedules.length" class="text-center py-12">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
          <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando horários...</p>
        </div>

        <!-- Error -->
        <div v-else-if="schedulesError" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
          <div class="flex">
            <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
            <p class="text-red-700 dark:text-red-400">{{ schedulesError }}</p>
          </div>
        </div>

        <!-- Lista de Horários - Desktop -->
        <div v-else-if="schedules.length > 0" class="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Código da Rota
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Origem → Destino
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Localização
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Horários
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="schedule in schedules" :key="schedule.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ schedule.routeCode || '-' }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ schedule.route.origin }} → {{ schedule.route.destination }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ schedule.city }} - {{ schedule.state }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      <div v-if="Array.isArray(schedule.times)" class="space-y-1">
                        <div v-for="(time, idx) in schedule.times.slice(0, 3)" :key="idx">
                          {{ time }}
                        </div>
                        <div v-if="schedule.times.length > 3" class="text-xs text-gray-500">
                          +{{ schedule.times.length - 3 }} mais
                        </div>
                      </div>
                      <div v-else>
                        {{ JSON.stringify(schedule.times) }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge :color="schedule.route.isActive ? 'success' : 'error'" variant="subtle">
                      {{ schedule.route.isActive ? 'Ativo' : 'Inativo' }}
                    </UBadge>
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
                    {{ schedule.routeCode || 'Sem código' }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ schedule.route.origin }} → {{ schedule.route.destination }}
                  </p>
                </div>
                <UBadge :color="schedule.route.isActive ? 'success' : 'error'" variant="subtle" class="ml-2 shrink-0">
                  {{ schedule.route.isActive ? 'Ativo' : 'Inativo' }}
                </UBadge>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <UIcon name="i-lucide-map-pin" class="mr-2 shrink-0" />
                  <span>{{ schedule.city }} - {{ schedule.state }}</span>
                </div>
                <div class="flex items-start text-gray-600 dark:text-gray-400">
                  <UIcon name="i-lucide-clock" class="mr-2 shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <div v-if="Array.isArray(schedule.times)" class="space-y-1">
                      <div v-for="(time, idx) in schedule.times.slice(0, 3)" :key="idx">
                        {{ time }}
                      </div>
                      <div v-if="schedule.times.length > 3" class="text-xs text-gray-500">
                        +{{ schedule.times.length - 3 }} mais horários
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginação -->
          <div v-if="schedulesPagination && schedulesPagination.totalPages > 1" class="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Mostrando {{ ((schedulesPagination.page - 1) * schedulesPagination.limit) + 1 }} a 
                {{ Math.min(schedulesPagination.page * schedulesPagination.limit, schedulesPagination.total) }} de 
                {{ schedulesPagination.total }} resultados
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <UButton
                  icon="i-lucide-chevron-left"
                  size="sm"
                  :disabled="schedulesPagination.page === 1"
                  class="flex-1 sm:flex-none"
                  @click="changeSchedulesPage(schedulesPagination.page - 1)"
                >
                  <span class="hidden sm:inline">Anterior</span>
                </UButton>
                <UButton
                  icon="i-lucide-chevron-right"
                  size="sm"
                  :disabled="schedulesPagination.page === schedulesPagination.totalPages"
                  class="flex-1 sm:flex-none"
                  @click="changeSchedulesPage(schedulesPagination.page + 1)"
                >
                  <span class="hidden sm:inline">Próxima</span>
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow p-12 text-center">
          <UIcon name="i-lucide-clock" class="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum horário encontrado
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Não há horários designados para você no momento
          </p>
        </div>
      </div>

      <!-- Tab: Veículos -->
      <div v-show="activeTab === 1">
        <!-- Filtros de Veículos -->
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div class="md:col-span-1">
              <UInput
                v-model="vehiclesFilters.search"
                icon="i-lucide-search"
                placeholder="Buscar por placa, marca ou modelo..."
                @input="debouncedVehiclesSearch"
              />
            </div>
            <div class="md:col-span-1">
              <USelect
                v-model="vehiclesFilters.isActive"
                :items="statusOptions"
                placeholder="Filtrar por status"
                @change="handleVehiclesFilterChange"
              />
            </div>
            <div class="flex justify-start md:justify-end">
              <UButton
                variant="ghost"
                icon="i-lucide-refresh-cw"
                class="w-full md:w-auto"
                @click="resetVehiclesFilters"
              >
                Limpar Filtros
              </UButton>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="vehiclesLoading && !vehicles.length" class="text-center py-12">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
          <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando veículos...</p>
        </div>

        <!-- Error -->
        <div v-else-if="vehiclesError" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
          <div class="flex">
            <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
            <p class="text-red-700 dark:text-red-400">{{ vehiclesError }}</p>
          </div>
        </div>

        <!-- Lista de Veículos - Desktop -->
        <div v-else-if="vehicles.length > 0" class="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Placa
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ano
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Capacidade
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rotas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="vehicle in vehicles" :key="vehicle.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ vehicle.plate }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ vehicle.brand }} {{ vehicle.model }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ vehicle.year }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ vehicle.capacity }} passageiros
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      <div v-if="vehicle.routes && vehicle.routes.length > 0" class="space-y-1">
                        <div v-for="rv in vehicle.routes.slice(0, 2)" :key="rv.id">
                          {{ rv.route.code || rv.route.origin }}
                        </div>
                        <div v-if="vehicle.routes.length > 2" class="text-xs text-gray-500">
                          +{{ vehicle.routes.length - 2 }} mais
                        </div>
                      </div>
                      <div v-else class="text-gray-400">
                        Nenhuma rota
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge :color="vehicle.isActive ? 'success' : 'error'" variant="subtle">
                      {{ vehicle.isActive ? 'Ativo' : 'Inativo' }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards para mobile -->
          <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {{ vehicle.plate }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
                  </p>
                </div>
                <UBadge :color="vehicle.isActive ? 'success' : 'error'" variant="subtle" class="ml-2 shrink-0">
                  {{ vehicle.isActive ? 'Ativo' : 'Inativo' }}
                </UBadge>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex items-center text-gray-600 dark:text-gray-400">
                  <UIcon name="i-lucide-users" class="mr-2 shrink-0" />
                  <span>Capacidade: {{ vehicle.capacity }} passageiros</span>
                </div>
                <div v-if="vehicle.routes && vehicle.routes.length > 0" class="flex items-start text-gray-600 dark:text-gray-400">
                  <UIcon name="i-lucide-route" class="mr-2 shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <div class="space-y-1">
                      <div v-for="rv in vehicle.routes.slice(0, 2)" :key="rv.id">
                        {{ rv.route.code || rv.route.origin }} → {{ rv.route.destination }}
                      </div>
                      <div v-if="vehicle.routes.length > 2" class="text-xs text-gray-500">
                        +{{ vehicle.routes.length - 2 }} mais rotas
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="flex items-center text-gray-400">
                  <UIcon name="i-lucide-route" class="mr-2 shrink-0" />
                  <span>Nenhuma rota vinculada</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginação -->
          <div v-if="vehiclesPagination && vehiclesPagination.totalPages > 1" class="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Mostrando {{ ((vehiclesPagination.page - 1) * vehiclesPagination.limit) + 1 }} a 
                {{ Math.min(vehiclesPagination.page * vehiclesPagination.limit, vehiclesPagination.total) }} de 
                {{ vehiclesPagination.total }} resultados
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <UButton
                  icon="i-lucide-chevron-left"
                  size="sm"
                  :disabled="vehiclesPagination.page === 1"
                  class="flex-1 sm:flex-none"
                  @click="changeVehiclesPage(vehiclesPagination.page - 1)"
                >
                  <span class="hidden sm:inline">Anterior</span>
                </UButton>
                <UButton
                  icon="i-lucide-chevron-right"
                  size="sm"
                  :disabled="vehiclesPagination.page === vehiclesPagination.totalPages"
                  class="flex-1 sm:flex-none"
                  @click="changeVehiclesPage(vehiclesPagination.page + 1)"
                >
                  <span class="hidden sm:inline">Próxima</span>
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow p-12 text-center">
          <UIcon name="i-lucide-car" class="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum veículo encontrado
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Não há veículos designados para você no momento
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useSchedules, type Schedule } from '~/composables/useSchedules'
import { useAuthStore } from '~/stores/useAuthStore'

definePageMeta({
  middleware: 'authenticated',
})

const authStore = useAuthStore()

// Tabs
const activeTab = ref(0)

// Schedules
const {
  schedules,
  pagination: schedulesPagination,
  loading: schedulesLoading,
  error: schedulesError,
  fetchSchedules,
} = useSchedules()

const schedulesFilters = reactive({
  search: '',
  page: 1,
  limit: 10,
})

// Vehicles
const vehicles = ref<any[]>([])
const vehiclesPagination = ref<any>(null)
const vehiclesLoading = ref(false)
const vehiclesError = ref<string | null>(null)

const vehiclesFilters = reactive({
  search: '',
  isActive: undefined as boolean | undefined,
  page: 1,
  limit: 10,
})

const statusOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Ativos', value: true },
  { label: 'Inativos', value: false },
]

const companyName = ref('')

// Carregar nome da empresa
const loadCompanyName = async () => {
  try {
    const response = await $fetch('/api/companies/my-company', {
      method: 'GET',
    })
    if (response && typeof response === 'object' && 'data' in response) {
      companyName.value = (response as any).data?.name || ''
    }
  } catch (err) {
    console.error('Erro ao carregar empresa:', err)
  }
}

let searchTimeout: NodeJS.Timeout

// Schedules methods
const debouncedSchedulesSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    schedulesFilters.page = 1
    loadSchedules()
  }, 500)
}

const resetSchedulesFilters = () => {
  schedulesFilters.search = ''
  schedulesFilters.page = 1
  loadSchedules()
}

const changeSchedulesPage = (page: number) => {
  schedulesFilters.page = page
  loadSchedules()
}

const loadSchedules = async () => {
  await fetchSchedules({
    search: schedulesFilters.search,
    page: schedulesFilters.page,
    limit: schedulesFilters.limit,
  })
}

// Vehicles methods
const debouncedVehiclesSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    vehiclesFilters.page = 1
    loadVehicles()
  }, 500)
}

const handleVehiclesFilterChange = () => {
  vehiclesFilters.page = 1
  loadVehicles()
}

const resetVehiclesFilters = () => {
  vehiclesFilters.search = ''
  vehiclesFilters.isActive = undefined
  vehiclesFilters.page = 1
  loadVehicles()
}

const changeVehiclesPage = (page: number) => {
  vehiclesFilters.page = page
  loadVehicles()
}

const loadVehicles = async () => {
  vehiclesLoading.value = true
  vehiclesError.value = null

  try {
    const query: any = {
      page: vehiclesFilters.page,
      limit: vehiclesFilters.limit,
    }
    
    if (vehiclesFilters.search) query.search = vehiclesFilters.search
    if (typeof vehiclesFilters.isActive !== 'undefined') query.isActive = vehiclesFilters.isActive

    const response = await $fetch('/api/vehicles/by-company', {
      method: 'GET',
      query,
    })

    if (response && typeof response === 'object' && 'data' in response) {
      vehicles.value = (response as any).data
      vehiclesPagination.value = (response as any).pagination
    }
  } catch (err: any) {
    vehiclesError.value = err?.data?.statusMessage || 'Erro ao buscar veículos'
    console.error('Erro ao buscar veículos:', err)
  } finally {
    vehiclesLoading.value = false
  }
}

onMounted(async () => {
  await loadCompanyName()
  await loadSchedules()
  await loadVehicles()
})
</script>
