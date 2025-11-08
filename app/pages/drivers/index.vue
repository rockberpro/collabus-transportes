<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Motoristas
            </h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Gerencie os motoristas da sua empresa
            </p>
          </div>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            @click="openAddDriverModal"
          >
            Adicionar Motorista
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
              placeholder="Buscar por nome ou email..."
              @input="debouncedSearch"
            />
          </div>
          <div>
            <USelect
              v-model="filters.isActive"
              :options="statusOptions"
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
      <div v-if="loading && !drivers.length" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando motoristas...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
        <div class="flex">
          <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Lista de Motoristas -->
      <div v-else-if="drivers.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CPF
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Telefone
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
              <tr v-for="driver in drivers" :key="driver.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ driver.person ? `${driver.person.firstName} ${driver.person.lastName}` : '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ driver.email }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ driver.person?.cpf || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ driver.person?.phone || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge :color="driver.isActive ? 'success' : 'error'" variant="subtle">
                    {{ driver.isActive ? 'Ativo' : 'Inativo' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <UButton
                      v-if="driver.isActive"
                      icon="i-lucide-user-x"
                      size="sm"
                      color="warning"
                      variant="ghost"
                      @click="toggleDriverStatus(driver)"
                    >
                      Desativar
                    </UButton>
                    <UButton
                      v-else
                      icon="i-lucide-user-check"
                      size="sm"
                      color="success"
                      variant="ghost"
                      @click="toggleDriverStatus(driver)"
                    >
                      Ativar
                    </UButton>
                    <UButton
                      icon="i-lucide-trash-2"
                      size="sm"
                      color="error"
                      variant="ghost"
                      @click="confirmRemoveDriver(driver)"
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
        <UIcon name="i-lucide-users" class="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum motorista encontrado
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Comece adicionando motoristas à sua empresa
        </p>
        <UButton @click="openAddDriverModal">
          Adicionar Primeiro Motorista
        </UButton>
      </div>
    </div>

    <!-- Modal Adicionar Motorista -->
    <UModal v-model="showAddModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Adicionar Motorista</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showAddModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <UInput
              v-model="userSearch"
              icon="i-lucide-search"
              placeholder="Buscar usuários..."
              @input="debouncedUserSearch"
            />
          </div>

          <div v-if="loadingUsers" class="text-center py-8">
            <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-primary-500" />
          </div>

          <div v-else-if="availableUsers.length > 0" class="max-h-96 overflow-y-auto">
            <div
              v-for="user in availableUsers"
              :key="user.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ user.person ? `${user.person.firstName} ${user.person.lastName}` : 'Sem nome' }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ user.email }}
                </div>
                <div v-if="user.person?.cpf" class="text-xs text-gray-500 dark:text-gray-500">
                  CPF: {{ user.person.cpf }}
                </div>
              </div>
              <UButton
                size="sm"
                :loading="addingUserId === user.id"
                @click="handleAddDriver(user.id)"
              >
                Adicionar
              </UButton>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-600 dark:text-gray-400">
            Nenhum usuário disponível encontrado
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useDrivers, type Driver } from '~/composables/useDrivers'

definePageMeta({
  middleware: 'authenticated',
})

const {
  drivers,
  availableUsers,
  pagination,
  loading,
  error,
  fetchDrivers,
  fetchAvailableUsers,
  addDriver,
  updateDriver,
  removeDriver,
} = useDrivers()

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
const userSearch = ref('')
const loadingUsers = ref(false)
const addingUserId = ref<string | null>(null)

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadDrivers()
  }, 500)
}

const debouncedUserSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadAvailableUsers()
  }, 500)
}

const handleFilterChange = () => {
  filters.page = 1
  loadDrivers()
}

const resetFilters = () => {
  filters.search = ''
  filters.isActive = undefined
  filters.page = 1
  loadDrivers()
}

const changePage = (page: number) => {
  filters.page = page
  loadDrivers()
}

const loadDrivers = async () => {
  await fetchDrivers(filters)
}

const loadAvailableUsers = async () => {
  loadingUsers.value = true
  try {
    await fetchAvailableUsers(userSearch.value)
  } finally {
    loadingUsers.value = false
  }
}

const openAddDriverModal = () => {
  showAddModal.value = true
  userSearch.value = ''
  loadAvailableUsers()
}

const handleAddDriver = async (userId: string) => {
  addingUserId.value = userId
  try {
    await addDriver(userId)
    showAddModal.value = false
    await loadDrivers()
    // Toast de sucesso (se tiver)
  } catch (err) {
    // Erro já tratado no composable
  } finally {
    addingUserId.value = null
  }
}

const toggleDriverStatus = async (driver: Driver) => {
  try {
    await updateDriver(driver.id, { isActive: !driver.isActive })
    await loadDrivers()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const confirmRemoveDriver = async (driver: Driver) => {
  const confirmed = confirm(
    `Tem certeza que deseja remover ${driver.person?.firstName} ${driver.person?.lastName} como motorista?`
  )
  
  if (confirmed) {
    try {
      await removeDriver(driver.id)
      await loadDrivers()
    } catch (err) {
      // Erro já tratado no composable
    }
  }
}

onMounted(() => {
  loadDrivers()
})
</script>
