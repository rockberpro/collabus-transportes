<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
    <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
      Pessoas Associadas
    </h3>
    
    <div v-if="loading" class="text-center py-4">
      <UIcon name="mdi:loading" class="animate-spin text-2xl text-gray-400" />
      <p class="text-sm text-gray-500 mt-2">Carregando pessoas...</p>
    </div>
    
    <div v-else-if="persons && persons.length > 0" class="space-y-3">
      <div
        v-for="person in persons"
        :key="person.id"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
      >
        <div class="flex items-center space-x-3">
          <UIcon name="mdi:account-circle" class="text-2xl text-teal-500" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ person.name }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Criado em {{ formatDate(person.createdAt) }}
            </p>
          </div>
        </div>
        
        <UButton
          icon="mdi:dots-vertical"
          variant="ghost"
          size="sm"
          @click="$emit('editPerson', person)"
        />
      </div>
    </div>
    
    <div v-else class="text-center py-8">
      <UIcon name="mdi:account-plus" class="text-4xl text-gray-300 mx-auto mb-2" />
      <p class="text-gray-500 dark:text-gray-400">
        Nenhuma pessoa associada ainda
      </p>
    </div>
    
    <UButton
      class="w-full mt-4"
      icon="mdi:plus"
      variant="outline"
      @click="$emit('addPerson')"
    >
      Adicionar Pessoa
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { PersonWithUser } from '../../types/person'

interface Props {
  persons?: PersonWithUser[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addPerson: []
  editPerson: [person: PersonWithUser]
}>()

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>
