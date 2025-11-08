<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Veículos
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie a frota de veículos da empresa
            </p>
          </div>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            @click="openAddVehicleModal"
          >
            Adicionar Veículo
          </UButton>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <UInput
              v-model="filters.search"
              icon="i-lucide-search"
              placeholder="Buscar por placa, marca ou modelo..."
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
      <div v-if="loading && !vehicles.length" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando veículos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
        <div class="flex">
          <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Lista de Veículos -->
      <div v-else-if="vehicles.length > 0" class="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Placa
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Marca
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Modelo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ano
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Capacidade
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Empresa
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
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
                    {{ vehicle.brand }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ vehicle.model }}
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
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {{ vehicle.company.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge :color="vehicle.isActive ? 'success' : 'error'" variant="subtle">
                    {{ vehicle.isActive ? 'Ativo' : 'Inativo' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <UButton
                      v-if="vehicle.isActive"
                      icon="i-lucide-ban"
                      size="sm"
                      color="warning"
                      variant="ghost"
                      @click="toggleVehicleStatus(vehicle)"
                    >
                      Desativar
                    </UButton>
                    <UButton
                      v-else
                      icon="i-lucide-check-circle"
                      size="sm"
                      color="success"
                      variant="ghost"
                      @click="toggleVehicleStatus(vehicle)"
                    >
                      Ativar
                    </UButton>
                    <UButton
                      icon="i-lucide-trash-2"
                      size="sm"
                      color="error"
                      variant="ghost"
                      @click="confirmRemoveVehicle(vehicle)"
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
      <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow p-12 text-center">
        <UIcon name="i-lucide-car" class="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum veículo encontrado
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Comece adicionando veículos à frota
        </p>
        <UButton @click="openAddVehicleModal">
          Adicionar Primeiro Veículo
        </UButton>
      </div>
    </div>

    <!-- Modal Adicionar Veículo -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click="showAddModal = false">
      <UCard class="max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Adicionar Veículo</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showAddModal = false"
            />
          </div>
        </template>

        <form @submit.prevent="handleAddVehicle" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Placa *
            </label>
            <UInput
              v-model="newVehicle.plate"
              placeholder="ABC-1234"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marca *
            </label>
            <UInput
              v-model="newVehicle.brand"
              placeholder="Ex: Mercedes-Benz"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modelo *
            </label>
            <UInput
              v-model="newVehicle.model"
              placeholder="Ex: Sprinter"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ano *
              </label>
              <UInput
                v-model="newVehicle.year"
                type="number"
                :min="1900"
                :max="new Date().getFullYear() + 1"
                placeholder="2024"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacidade *
              </label>
              <UInput
                v-model="newVehicle.capacity"
                type="number"
                min="1"
                max="100"
                placeholder="20"
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
              @click="handleAddVehicle"
            >
              Adicionar
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useVehicles, type Vehicle } from '~/composables/useVehicles'

definePageMeta({
  middleware: 'authenticated',
})

const {
  vehicles,
  pagination,
  loading,
  error,
  fetchVehicles,
  addVehicle,
  updateVehicle,
  removeVehicle,
} = useVehicles()

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

const newVehicle = reactive({
  plate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  capacity: 20,
})

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadVehicles()
  }, 500)
}

const handleFilterChange = () => {
  filters.page = 1
  loadVehicles()
}

const resetFilters = () => {
  filters.search = ''
  filters.isActive = undefined
  filters.page = 1
  loadVehicles()
}

const changePage = (page: number) => {
  filters.page = page
  loadVehicles()
}

const loadVehicles = async () => {
  await fetchVehicles(filters)
}

const openAddVehicleModal = () => {
  newVehicle.plate = ''
  newVehicle.brand = ''
  newVehicle.model = ''
  newVehicle.year = new Date().getFullYear()
  newVehicle.capacity = 20
  showAddModal.value = true
}

const handleAddVehicle = async () => {
  if (!newVehicle.plate || !newVehicle.brand || !newVehicle.model) {
    return
  }

  try {
    await addVehicle({
      plate: newVehicle.plate.trim().toUpperCase(),
      brand: newVehicle.brand.trim(),
      model: newVehicle.model.trim(),
      year: Number(newVehicle.year),
      capacity: Number(newVehicle.capacity),
    })
    showAddModal.value = false
    await loadVehicles()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const toggleVehicleStatus = async (vehicle: Vehicle) => {
  try {
    await updateVehicle(vehicle.id, { isActive: !vehicle.isActive })
    await loadVehicles()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const confirmRemoveVehicle = async (vehicle: Vehicle) => {
  const confirmed = confirm(
    `Tem certeza que deseja remover o veículo ${vehicle.plate}?`
  )
  
  if (confirmed) {
    try {
      await removeVehicle(vehicle.id)
      await loadVehicles()
    } catch (err) {
      // Erro já tratado no composable
    }
  }
}

onMounted(async () => {
  await loadVehicles()
})
</script>
