<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Rotas
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie as rotas de transporte da empresa
            </p>
          </div>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            @click="openAddRouteModal"
          >
            Adicionar Rota
          </UButton>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <UInput
              v-model="filters.search"
              icon="i-lucide-search"
              placeholder="Buscar por código, origem ou destino..."
              @input="debouncedSearch"
            />
          </div>
          <div>
            <USelect
              v-model="filters.isActive"
              :items="statusOptions"
              placeholder="Filtrar por status"
              @change="handleFilterChange"
            />
          </div>
          <div class="flex justify-end">
            <UButton
              variant="ghost"
              icon="i-lucide-refresh-cw"
              @click="resetFilters"
            >
              Limpar Filtros
            </UButton>
          </div>
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

      <!-- Lista de Rotas -->
      <div v-else-if="routes.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
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
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cidade
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="route in routes" :key="route.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ route.code || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.origin }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.destination }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.state }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ route.city }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge :color="route.isActive ? 'success' : 'error'" variant="subtle">
                    {{ route.isActive ? 'Ativo' : 'Inativo' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <UButton
                      icon="i-lucide-car"
                      size="sm"
                      color="primary"
                      variant="ghost"
                      @click="openVehiclesModal(route)"
                      :title="`${route.vehicles?.length || 0} veículo(s)`"
                    >
                      Veículos ({{ route.vehicles?.length || 0 }})
                    </UButton>
                    <UButton
                      v-if="route.isActive"
                      icon="i-lucide-ban"
                      size="sm"
                      color="warning"
                      variant="ghost"
                      @click="toggleRouteStatus(route)"
                    >
                      Desativar
                    </UButton>
                    <UButton
                      v-else
                      icon="i-lucide-check-circle"
                      size="sm"
                      color="success"
                      variant="ghost"
                      @click="toggleRouteStatus(route)"
                    >
                      Ativar
                    </UButton>
                    <UButton
                      icon="i-lucide-trash-2"
                      size="sm"
                      color="error"
                      variant="ghost"
                      @click="confirmRemoveRoute(route)"
                    >
                      Remover
                    </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div v-if="pagination && pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {{ ((pagination.page - 1) * pagination.limit) + 1 }} a 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de 
              {{ pagination.total }} resultados
            </div>
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-chevron-left"
                size="sm"
                :disabled="pagination.page === 1"
                @click="changePage(pagination.page - 1)"
              >
                Anterior
              </UButton>
              <UButton
                icon="i-lucide-chevron-right"
                size="sm"
                :disabled="pagination.page === pagination.totalPages"
                @click="changePage(pagination.page + 1)"
              >
                Próxima
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <UIcon name="i-lucide-route" class="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhuma rota encontrada
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Comece adicionando rotas de transporte
        </p>
        <UButton @click="openAddRouteModal">
          Adicionar Primeira Rota
        </UButton>
      </div>
    </div>

    <!-- Modal Adicionar Rota -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click="showAddModal = false">
      <UCard class="max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Adicionar Rota</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showAddModal = false"
            />
          </div>
        </template>

        <form @submit.prevent="handleAddRoute" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código *
            </label>
            <UInput
              v-model="newRoute.code"
              placeholder="Ex: R001"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Origem *
            </label>
            <UInput
              v-model="newRoute.origin"
              placeholder="Ex: Centro"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destino *
            </label>
            <UInput
              v-model="newRoute.destination"
              placeholder="Ex: Bairro Industrial"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <UInput
                v-model="newRoute.state"
                placeholder="Ex: RS"
                maxlength="2"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cidade *
              </label>
              <UInput
                v-model="newRoute.city"
                placeholder="Ex: Lajeado"
                required
              />
            </div>
          </div>
        </form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showAddModal = false"
            >
              Cancelar
            </UButton>
            <UButton
              :loading="loading"
              @click="handleAddRoute"
            >
              Adicionar
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Modal Gerenciar Veículos -->
    <div v-if="showVehiclesModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click="showVehiclesModal = false">
      <UCard class="max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Veículos da Rota</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ selectedRoute?.code || 'Sem código' }} - {{ selectedRoute?.origin }} → {{ selectedRoute?.destination }}
              </p>
            </div>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showVehiclesModal = false"
            />
          </div>
        </template>

        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div v-if="vehicles.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum veículo disponível
          </div>
          
          <div
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ vehicle.plate }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500">
                Capacidade: {{ vehicle.capacity }} passageiros
              </div>
            </div>
            
            <div>
              <UButton
                v-if="isVehicleAssigned(vehicle.id)"
                icon="i-lucide-x"
                size="sm"
                color="error"
                @click="handleUnassignVehicle(vehicle.id)"
              >
                Desvincular
              </UButton>
              <UButton
                v-else
                icon="i-lucide-plus"
                size="sm"
                color="primary"
                @click="handleAssignVehicle(vehicle.id)"
              >
                Vincular
              </UButton>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              variant="ghost"
              @click="showVehiclesModal = false"
            >
              Fechar
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoutes, type Route } from '~/composables/useRoutes'
import { useVehicles } from '~/composables/useVehicles'

definePageMeta({
  middleware: 'authenticated',
})

const {
  routes,
  pagination,
  loading,
  error,
  fetchRoutes,
  addRoute,
  updateRoute,
  removeRoute,
  assignVehicle,
  unassignVehicle,
} = useRoutes()

const { vehicles, fetchVehicles } = useVehicles()

const filters = reactive({
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

const showAddModal = ref(false)
const showVehiclesModal = ref(false)
const selectedRoute = ref<Route | null>(null)

const newRoute = reactive({
  code: '',
  origin: '',
  destination: '',
  state: '',
  city: '',
})

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadRoutes()
  }, 500)
}

const handleFilterChange = () => {
  filters.page = 1
  loadRoutes()
}

const resetFilters = () => {
  filters.search = ''
  filters.isActive = undefined
  filters.page = 1
  loadRoutes()
}

const changePage = (page: number) => {
  filters.page = page
  loadRoutes()
}

const loadRoutes = async () => {
  await fetchRoutes(filters)
}

const openAddRouteModal = () => {
  newRoute.code = ''
  newRoute.origin = ''
  newRoute.destination = ''
  newRoute.state = ''
  newRoute.city = ''
  showAddModal.value = true
}

const handleAddRoute = async () => {
  if (!newRoute.code || !newRoute.origin || !newRoute.destination || !newRoute.state || !newRoute.city) {
    return
  }

  try {
    await addRoute({
      code: newRoute.code.trim().toUpperCase(),
      origin: newRoute.origin.trim(),
      destination: newRoute.destination.trim(),
      state: newRoute.state.trim().toUpperCase(),
      city: newRoute.city.trim(),
    })
    showAddModal.value = false
    await loadRoutes()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const toggleRouteStatus = async (route: Route) => {
  try {
    await updateRoute(route.id, { isActive: !route.isActive })
    await loadRoutes()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const confirmRemoveRoute = async (route: Route) => {
  const confirmed = confirm(
    `Tem certeza que deseja remover a rota ${route.code || 'sem código'}?`
  )
  
  if (confirmed) {
    try {
      await removeRoute(route.id)
      await loadRoutes()
    } catch (err) {
      // Erro já tratado no composable
    }
  }
}

const openVehiclesModal = async (route: Route) => {
  selectedRoute.value = route
  showVehiclesModal.value = true
  await fetchVehicles({ isActive: true })
}

const handleAssignVehicle = async (vehicleId: string) => {
  if (!selectedRoute.value) return

  try {
    await assignVehicle(selectedRoute.value.id, vehicleId)
    await loadRoutes()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const handleUnassignVehicle = async (vehicleId: string) => {
  if (!selectedRoute.value) return

  try {
    await unassignVehicle(selectedRoute.value.id, vehicleId)
    await loadRoutes()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const isVehicleAssigned = (vehicleId: string): boolean => {
  if (!selectedRoute.value?.vehicles) return false
  return selectedRoute.value.vehicles.some(rv => rv.vehicle.id === vehicleId)
}

onMounted(async () => {
  await loadRoutes()
})
</script>
