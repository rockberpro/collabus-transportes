<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Motoristas
            </h1>
            <p v-if="company" class="mt-1 md:mt-2 text-base md:text-lg font-medium text-primary-600 dark:text-primary-400">
              {{ company.name }}
            </p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie os motoristas da sua empresa
            </p>
          </div>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            class="w-full sm:w-auto"
            @click="openAddDriverModal"
          >
            <span class="sm:inline">Adicionar Motorista</span>
            <span class="hidden sm:hidden">Adicionar</span>
          </UButton>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div class="md:col-span-1">
            <UInput
              v-model="filters.search"
              icon="i-lucide-search"
              placeholder="Buscar por nome ou email..."
              @input="debouncedSearch"
            />
          </div>
          <div class="md:col-span-1">
            <USelect
              v-model="filters.isActive"
              :items="statusOptions"
              placeholder="Filtrar por status"
              @change="handleFilterChange"
            />
          </div>
          <div class="flex justify-start md:justify-end">
            <UButton
              variant="ghost"
              icon="i-lucide-refresh-cw"
              class="w-full md:w-auto"
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

      <!-- Lista de Motoristas - Desktop (tabela) -->
      <div v-else-if="drivers.length > 0" class="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <!-- Tabela para telas médias e grandes -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-zinc-50 dark:bg-zinc-900">
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
            <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="driver in drivers" :key="driver.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-700">
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
                  <div class="flex justify-end gap-3 items-center">
                    <UButton
                      v-if="driver.isActive"
                      icon="i-lucide-user-x"
                      size="xl"
                      color="warning"
                      variant="ghost"
                      @click="toggleDriverStatus(driver)"
                      title="Desativar"
                    />
                    <UButton
                      v-else
                      icon="i-lucide-user-check"
                      size="xl"
                      color="success"
                      variant="ghost"
                      @click="toggleDriverStatus(driver)"
                      title="Ativar"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      size="xl"
                      color="error"
                      variant="ghost"
                      @click="confirmRemoveDriver(driver)"
                      title="Remover"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards para mobile -->
        <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="driver in drivers"
            :key="driver.id"
            class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {{ driver.person ? `${driver.person.firstName} ${driver.person.lastName}` : '-' }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {{ driver.email }}
                </p>
              </div>
              <UBadge :color="driver.isActive ? 'success' : 'error'" variant="subtle" class="ml-2 shrink-0">
                {{ driver.isActive ? 'Ativo' : 'Inativo' }}
              </UBadge>
            </div>
            
            <div class="space-y-1 mb-3 text-sm">
              <div v-if="driver.person?.cpf" class="flex items-center text-gray-600 dark:text-gray-400">
                <UIcon name="i-lucide-credit-card" class="mr-2 shrink-0" />
                <span class="truncate">{{ driver.person.cpf }}</span>
              </div>
              <div v-if="driver.person?.phone" class="flex items-center text-gray-600 dark:text-gray-400">
                <UIcon name="i-lucide-phone" class="mr-2 shrink-0" />
                <span class="truncate">{{ driver.person.phone }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton
                v-if="driver.isActive"
                icon="i-lucide-user-x"
                size="sm"
                color="warning"
                variant="ghost"
                class="flex-1"
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
                class="flex-1"
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
              </UButton>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="pagination && pagination.totalPages > 1" class="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
              Mostrando {{ ((pagination.page - 1) * pagination.limit) + 1 }} a 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de 
              {{ pagination.total }} resultados
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
              <UButton
                icon="i-lucide-chevron-left"
                size="sm"
                :disabled="pagination.page === 1"
                class="flex-1 sm:flex-none"
                @click="changePage(pagination.page - 1)"
              >
                <span class="hidden sm:inline">Anterior</span>
              </UButton>
              <UButton
                icon="i-lucide-chevron-right"
                size="sm"
                :disabled="pagination.page === pagination.totalPages"
                class="flex-1 sm:flex-none"
                @click="changePage(pagination.page + 1)"
              >
                <span class="hidden sm:inline">Próxima</span>
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow p-12 text-center">
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
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click="showAddModal = false">
      <UCard class="max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4" @click.stop>
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
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
    </div>
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
  company,
  loading,
  error,
  fetchDrivers,
  fetchCompany,
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
  fetchCompany()
  loadDrivers()
})
</script>
