<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Welcome Header -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {{ greeting }}, {{ firstName }}! 👋
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ roleDescription }}
        </p>
      </div>

      <!-- Quick Stats (Admin/Supervisor only) -->
      <div v-if="isAdminOrSupervisor" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Rotas</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ statsLoading ? '-' : stats?.routes || 0 }}
              </p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UIcon name="i-lucide-map" class="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Motoristas</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ statsLoading ? '-' : stats?.drivers || 0 }}
              </p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UIcon name="i-lucide-users" class="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Veículos</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ statsLoading ? '-' : stats?.vehicles || 0 }}
              </p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UIcon name="i-lucide-truck" class="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Horários</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ statsLoading ? '-' : stats?.schedules || 0 }}
              </p>
            </div>
            <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <UIcon name="i-lucide-calendar-clock" class="text-2xl text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acesso Rápido</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <NuxtLink 
            to="/routes"
            class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UIcon name="i-lucide-map" class="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Rotas</span>
            </div>
          </NuxtLink>

          <NuxtLink 
            to="/schedules"
            class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UIcon name="i-lucide-calendar" class="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Horários</span>
            </div>
          </NuxtLink>

          <NuxtLink 
            v-if="isAdmin || user?.role === 'SUPERVISOR'"
            to="/drivers"
            class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UIcon name="i-lucide-user-cog" class="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Motoristas</span>
            </div>
          </NuxtLink>

          <NuxtLink 
            v-if="isAdmin || user?.role === 'SUPERVISOR'"
            to="/vehicles"
            class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <UIcon name="i-lucide-truck" class="text-2xl text-orange-600 dark:text-orange-400" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Veículos</span>
            </div>
          </NuxtLink>

          <NuxtLink 
            v-if="isAdmin || user?.role === 'SUPERVISOR'"
            to="/routes/manage"
            class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <UIcon name="i-lucide-route" class="text-2xl text-red-600 dark:text-red-400" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Gerenciar Rotas</span>
            </div>
          </NuxtLink>

          <NuxtLink 
            v-if="isAdmin"
            to="/supervisors"
            class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <UIcon name="i-lucide-shield-check" class="text-2xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Supervisores</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- User Info Card -->
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 md:p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações da Conta</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
              <UIcon name="i-lucide-user" class="text-xl text-gray-600 dark:text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</p>
              <p class="text-sm text-gray-900 dark:text-white truncate">
                {{ user?.name || "Não disponível" }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
              <UIcon name="i-lucide-mail" class="text-xl text-gray-600 dark:text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</p>
              <p class="text-sm text-gray-900 dark:text-white truncate">
                {{ user?.email || "Não disponível" }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
              <UIcon name="i-lucide-shield" class="text-xl text-gray-600 dark:text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Conta</p>
              <p class="text-sm text-gray-900 dark:text-white">
                <UBadge :color="getRoleBadgeColor(user?.role)" variant="subtle">
                  {{ getRoleLabel(user?.role) }}
                </UBadge>
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
              <UIcon name="i-lucide-calendar-days" class="text-xl text-gray-600 dark:text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Membro desde</p>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ formatDate(user?.createdAt || new Date()) }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/useAuthStore";
import { storeToRefs } from "pinia";
import { computed, ref, onMounted } from 'vue'

definePageMeta({
  middleware: ["authenticated"],
  layout: "default",
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Dashboard stats
const stats = ref<{
  routes: number
  drivers: number
  vehicles: number
  schedules: number
} | null>(null)
const statsLoading = ref(false)

// Time-based greeting
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

// Get first name from full name
const firstName = computed(() => {
  const name = user.value?.name || 'Usuário'
  return name.split(' ')[0]
})

// Role-based description
const roleDescription = computed(() => {
  const role = user.value?.role
  const descriptions: Record<string, string> = {
    'ADMINISTRADOR': 'Você tem acesso total ao sistema',
    'SUPERVISOR': 'Gerencie motoristas e rotas da sua empresa',
    'MOTORISTA': 'Visualize suas rotas e horários',
    'PASSAGEIRO': 'Consulte rotas e horários de ônibus'
  }
  return descriptions[role || 'PASSAGEIRO'] || 'Bem-vindo ao sistema de transportes'
})

// Role checks
const isAdmin = computed(() => user.value?.role === 'ADMINISTRADOR')
const isAdminOrSupervisor = computed(() => 
  user.value?.role === 'ADMINISTRADOR' || user.value?.role === 'SUPERVISOR'
)

// Fetch dashboard stats
const fetchStats = async () => {
  if (!isAdminOrSupervisor.value) return
  
  statsLoading.value = true
  try {
    const response = await $fetch('/api/dashboard/stats', {
      method: 'GET',
    })
    
    if (response && typeof response === 'object' && 'data' in response) {
      stats.value = (response as any).data
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
  } finally {
    statsLoading.value = false
  }
}

// Format date
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Get role label
const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    'ADMINISTRADOR': 'Administrador',
    'SUPERVISOR': 'Supervisor',
    'MOTORISTA': 'Motorista',
    'PASSAGEIRO': 'Passageiro'
  }
  return labels[role || 'PASSAGEIRO'] || role || 'Desconhecido'
}

// Get role badge color
const getRoleBadgeColor = (role?: string): "primary" | "error" | "warning" | "success" | "neutral" => {
  const colors: Record<string, "primary" | "error" | "warning" | "success" | "neutral"> = {
    'ADMINISTRADOR': 'error',
    'SUPERVISOR': 'warning',
    'MOTORISTA': 'primary',
    'PASSAGEIRO': 'success'
  }
  return colors[role || 'PASSAGEIRO'] || 'neutral'
}

// Load stats on mount
onMounted(() => {
  fetchStats()
})
</script>
