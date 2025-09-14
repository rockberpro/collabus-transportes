<template>
  <div class="min-h-full bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gerencie suas pessoas associadas
        </p>
      </div>

      <!-- Informações do Usuário -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Informações da Conta
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</p>
            <p class="text-gray-900 dark:text-white">{{ userInfo.email || 'Não disponível' }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Conta</p>
            <p class="text-gray-900 dark:text-white">{{ getUserTypeLabel(userInfo.type) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Membro desde</p>
            <p class="text-gray-900 dark:text-white">{{ formatDate(userInfo.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pessoas Associadas</p>
            <p class="text-gray-900 dark:text-white">{{ personsWithUser.length || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Lista de Pessoas -->
      <PersonsList
        :persons="personsWithUser"
        :loading="loading"
        @add-person="openAddPersonModal"
        @edit-person="editPerson"
      />

      <!-- Modal para adicionar pessoa -->
      <UModal v-model="showAddPersonModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Adicionar Nova Pessoa</h3>
          </template>
          
          <UForm @submit.prevent="handleAddPerson" :state="newPersonState">
            <div class="mb-4">
              <UFormField label="Nome da Pessoa" name="name">
                <UInput
                  v-model="newPersonState.name"
                  placeholder="Digite o nome completo"
                  icon="mdi:account"
                  :required="true"
                />
              </UFormField>
            </div>
            
            <div class="flex justify-end space-x-2">
              <UButton
                variant="outline"
                @click="closeAddPersonModal"
              >
                Cancelar
              </UButton>
              <UButton
                type="submit"
                :loading="addingPerson"
              >
                Adicionar
              </UButton>
            </div>
          </UForm>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { PersonWithUser, Person } from '../../types/person'

definePageMeta({
  middleware: 'auth'
})
const userInfo = reactive({
  id: '',
  email: '',
  type: 'passenger' as 'passenger' | 'driver' | 'admin',
  createdAt: new Date(),
  token: '',
})

const personsWithUser = ref<PersonWithUser[]>([])

const loading = ref(false)
const showAddPersonModal = ref(false)
const addingPerson = ref(false)

const newPersonState = reactive({
  name: ''
})

const { createPerson, getPersonsByUserId } = usePersons()
const { setToken, isAuthenticated } = useAuth()
const toast = useToast()
const router = useRouter()

const currentUserId = 'user-id-example'

onMounted(async () => {
  await loadUserData()
})

const loadUserData = async () => {
  loading.value = true
  try {
    if (!isAuthenticated.value) {
      router.push('/sign-in')
      return
    }
    Object.assign(userInfo, {
      id: currentUserId,
      email: 'usuario@exemplo.com',
      type: 'passenger',
      createdAt: new Date('2024-01-01'),
      token: 'authenticated',
    })

    const persons = await getPersonsByUserId(currentUserId)
    if (persons.success && persons.persons) {
      personsWithUser.value = persons.persons.map(person => ({
        ...person,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          type: userInfo.type,
          createdAt: userInfo.createdAt,
          token: userInfo.token
        }
      }))
    } else {
      personsWithUser.value = []
    }
  } catch (error: any) {
    console.error('Erro ao carregar dados do usuário:', error)
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      toast.add({
        title: 'Erro de Autenticação',
        description: 'Sua sessão expirou. Faça login novamente.',
        color: 'error'
      })
      router.push('/sign-in')
    } else {
      toast.add({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do usuário',
        color: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}

const openAddPersonModal = () => {
  showAddPersonModal.value = true
  newPersonState.name = ''
}

const closeAddPersonModal = () => {
  showAddPersonModal.value = false
  newPersonState.name = ''
}

const handleAddPerson = async () => {
  if (!newPersonState.name.trim()) {
    toast.add({
      title: 'Erro',
      description: 'Nome é obrigatório',
      color: 'error'
    })
    return
  }

  addingPerson.value = true
  try {
    const response = await createPerson({
      name: newPersonState.name,
      userId: userInfo.id!
    })

    if (response.success) {
      // Add the new person with user data
      personsWithUser.value.push({
        ...response.person,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          type: userInfo.type,
          createdAt: userInfo.createdAt,
          token: userInfo.token
        }
      })
      closeAddPersonModal()
      toast.add({
        title: 'Sucesso',
        description: 'Pessoa adicionada com sucesso',
        color: 'success'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: error.data?.message || 'Erro ao adicionar pessoa',
      color: 'error'
    })
  } finally {
    addingPerson.value = false
  }
}

const editPerson = (person: PersonWithUser) => {
  toast.add({
    title: 'Em desenvolvimento',
    description: 'Funcionalidade de edição será implementada em breve',
    color: 'info'
  })
}

const getUserTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    passenger: 'Passageiro',
    driver: 'Motorista',
    admin: 'Administrador'
  }
  return labels[type] || type
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>
