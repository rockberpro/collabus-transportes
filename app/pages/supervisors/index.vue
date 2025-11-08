<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Supervisores
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie os supervisores das empresas
            </p>
          </div>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            @click="openAddSupervisorModal"
          >
            Adicionar Supervisor
          </UButton>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              v-model="selectedCompany"
              :options="companyOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Filtrar por empresa"
              @change="handleFilterChange"
            />
          </div>
          <div>
            <USelect
              v-model="selectedStatus"
              :options="statusOptions"
              option-attribute="label"
              value-attribute="value"
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
      <div v-if="loading && !supervisors.length" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando supervisores...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
        <div class="flex">
          <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Lista de Supervisores -->
      <div v-else-if="supervisors.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="supervisor in supervisors" :key="supervisor.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ supervisor.person ? `${supervisor.person.firstName} ${supervisor.person.lastName}` : '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ supervisor.email }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ supervisor.person?.cpf || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ supervisor.person?.phone || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {{ supervisor.company?.name || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge :color="supervisor.isActive ? 'success' : 'error'" variant="subtle">
                    {{ supervisor.isActive ? 'Ativo' : 'Inativo' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <UButton
                      icon="i-lucide-building-2"
                      size="sm"
                      color="primary"
                      variant="ghost"
                      @click="openEditCompanyModal(supervisor)"
                    >
                      Empresa
                    </UButton>
                    <UButton
                      v-if="supervisor.isActive"
                      icon="i-lucide-user-x"
                      size="sm"
                      color="warning"
                      variant="ghost"
                      @click="toggleSupervisorStatus(supervisor)"
                    >
                      Desativar
                    </UButton>
                    <UButton
                      v-else
                      icon="i-lucide-user-check"
                      size="sm"
                      color="success"
                      variant="ghost"
                      @click="toggleSupervisorStatus(supervisor)"
                    >
                      Ativar
                    </UButton>
                    <UButton
                      icon="i-lucide-trash-2"
                      size="sm"
                      color="error"
                      variant="ghost"
                      @click="confirmRemoveSupervisor(supervisor)"
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
          Nenhum supervisor encontrado
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Comece adicionando supervisores às empresas
        </p>
        <UButton @click="openAddSupervisorModal">
          Adicionar Primeiro Supervisor
        </UButton>
      </div>
    </div>

    <!-- Modal Adicionar Supervisor -->
    <UModal v-model="showAddModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Adicionar Supervisor</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showAddModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Loading State -->
          <div v-if="loadingUsers" class="text-center py-8">
            <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-primary-500" />
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Carregando usuários...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div class="flex">
              <UIcon name="i-lucide-alert-circle" class="text-red-500 text-xl mr-3" />
              <p class="text-red-700 dark:text-red-400">{{ error }}</p>
            </div>
          </div>

          <!-- Users List -->
          <div v-else-if="availableUsers && availableUsers.length > 0" class="max-h-96 overflow-y-auto">
            <div
              v-for="user in availableUsers"
              :key="user.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-2"
            >
              <div class="flex-1">
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
              <div class="flex items-center gap-2">
                <USelect
                  v-model="selectedCompanyForUser[user.id]"
                  :options="companySelectOptions"
                  placeholder="Selecione empresa"
                  class="w-48"
                />
                <UButton
                  size="sm"
                  :loading="addingUserId === user.id"
                  :disabled="!selectedCompanyForUser[user.id]"
                  @click.stop="handleAddSupervisor(user.id)"
                >
                  Adicionar
                </UButton>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8 text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-users" class="text-4xl mx-auto mb-2" />
            <p>Nenhum usuário disponível para promover a supervisor</p>
            <p class="text-xs mt-1">Todos os passageiros já são supervisores ou não há passageiros cadastrados</p>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal Editar Empresa -->
    <UModal v-model="showEditCompanyModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Alterar Empresa do Supervisor</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showEditCompanyModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div v-if="editingSupervisor">
            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Supervisor:</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ editingSupervisor.person ? `${editingSupervisor.person.firstName} ${editingSupervisor.person.lastName}` : editingSupervisor.email }}
              </p>
            </div>
            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Empresa atual:</p>
              <p class="font-medium text-primary-600 dark:text-primary-400">
                {{ editingSupervisor.company?.name || 'Sem empresa' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova empresa:
              </label>
              <USelect
                v-model="newCompanyName"
                :options="companySelectOptions"
                placeholder="Selecione a nova empresa"
              />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showEditCompanyModal = false"
            >
              Cancelar
            </UButton>
            <UButton
              :loading="loading"
              :disabled="!newCompanyName"
              @click="handleUpdateCompany"
            >
              Salvar
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useSupervisors, type Supervisor } from '~/composables/useSupervisors'

definePageMeta({
  middleware: 'authenticated',
})

const {
  supervisors,
  availableUsers,
  companies,
  pagination,
  loading,
  loadingUsers,
  error,
  fetchSupervisors,
  fetchAvailableUsers,
  fetchCompanies,
  addSupervisor,
  updateSupervisor,
  removeSupervisor,
} = useSupervisors()

const filters = reactive({
  search: '',
  companyId: undefined as string | undefined,
  isActive: undefined as boolean | undefined,
  page: 1,
  limit: 10,
})

const selectedCompany = ref('all')
const selectedStatus = ref('all')

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativos', value: 'true' },
  { label: 'Inativos', value: 'false' },
]

const companyOptions = computed(() => [
  { label: 'Todas as empresas', value: 'all' },
  ...companies.value.map(c => ({ label: c.name, value: c.id }))
])

const companySelectOptions = computed(() =>
  companies.value.map(c => c.name)
)

const showAddModal = ref(false)
const showEditCompanyModal = ref(false)
const addingUserId = ref<string | null>(null)
const editingSupervisor = ref<Supervisor | null>(null)
const newCompanyName = ref<string>('')
const selectedCompanyForUser = ref<Record<string, string>>({})

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadSupervisors()
  }, 500)
}

const handleFilterChange = () => {
  filters.page = 1
  
  // Converter selectedCompany
  if (selectedCompany.value === 'all') {
    filters.companyId = undefined
  } else {
    filters.companyId = selectedCompany.value
  }
  
  // Converter selectedStatus
  if (selectedStatus.value === 'true') {
    filters.isActive = true
  } else if (selectedStatus.value === 'false') {
    filters.isActive = false
  } else {
    filters.isActive = undefined
  }
  
  loadSupervisors()
}

const resetFilters = () => {
  filters.search = ''
  filters.companyId = undefined
  filters.isActive = undefined
  selectedCompany.value = 'all'
  selectedStatus.value = 'all'
  filters.page = 1
  loadSupervisors()
}

const changePage = (page: number) => {
  filters.page = page
  loadSupervisors()
}

const loadSupervisors = async () => {
  await fetchSupervisors(filters)
}

const loadAvailableUsers = async () => {
  try {
    await fetchAvailableUsers()
    console.log('Usuários disponíveis carregados:', availableUsers.value.length)
  } catch (err) {
    console.error('Erro ao carregar usuários disponíveis:', err)
  }
}

const openAddSupervisorModal = async () => {
  showAddModal.value = true
  selectedCompanyForUser.value = {}
  await Promise.all([loadAvailableUsers(), fetchCompanies()])
}

const handleAddSupervisor = async (userId: string) => {
  const companyName = selectedCompanyForUser.value[userId]
  
  if (!companyName) {
    return
  }

  const company = companies.value.find(c => c.name === companyName)
  if (!company) return

  addingUserId.value = userId
  try {
    await addSupervisor(userId, company.id)
    showAddModal.value = false
    await loadSupervisors()
  } catch (err) {
    // Erro já tratado no composable
  } finally {
    addingUserId.value = null
  }
}

const openEditCompanyModal = async (supervisor: Supervisor) => {
  editingSupervisor.value = supervisor
  newCompanyName.value = supervisor.company?.name || ''
  showEditCompanyModal.value = true
  
  if (companies.value.length === 0) {
    await fetchCompanies()
  }
}

const handleUpdateCompany = async () => {
  if (!editingSupervisor.value || !newCompanyName.value) return

  const company = companies.value.find(c => c.name === newCompanyName.value)
  if (!company) return

  try {
    await updateSupervisor(editingSupervisor.value.id, { companyId: company.id })
    showEditCompanyModal.value = false
    editingSupervisor.value = null
    newCompanyName.value = ''
    await loadSupervisors()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const toggleSupervisorStatus = async (supervisor: Supervisor) => {
  try {
    await updateSupervisor(supervisor.id, { isActive: !supervisor.isActive })
    await loadSupervisors()
  } catch (err) {
    // Erro já tratado no composable
  }
}

const confirmRemoveSupervisor = async (supervisor: Supervisor) => {
  const confirmed = confirm(
    `Tem certeza que deseja remover ${supervisor.person?.firstName} ${supervisor.person?.lastName} como supervisor?`
  )
  
  if (confirmed) {
    try {
      await removeSupervisor(supervisor.id)
      await loadSupervisors()
    } catch (err) {
      // Erro já tratado no composable
    }
  }
}

onMounted(async () => {
  await Promise.all([loadSupervisors(), fetchCompanies()])
})
</script>
