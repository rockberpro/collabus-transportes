<template>
  <USlideover v-model:open="isOpen" side="right">
    <div class="cursor-pointer">
      <UUser
        :name="displayName"
        :avatar="userAvatar"
      />
    </div>

    <template #header>
      <div class="flex items-center gap-4 w-full">
        <div class="shrink-0">
          <UAvatar
            :src="userAvatar.src"
            :icon="userAvatar.icon"
            size="xl"
            :alt="displayName"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-lg truncate">{{ displayName }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ userRole }}</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-2">
        <UButton 
          size="lg" 
          variant="ghost" 
          class="w-full justify-start" 
          @click="goToProfile"
        >
          <template #leading>
            <UIcon name="i-lucide-user" class="text-xl" />
          </template>
          Sobre mim
        </UButton>

        <UButton 
          v-if="isSupervisor" 
          size="lg" 
          variant="ghost"
          class="w-full justify-start" 
          @click="goToDrivers"
        >
          <template #leading>
            <UIcon name="i-lucide-users" class="text-xl" />
          </template>
          Gerenciar motoristas
        </UButton>

        <UButton 
          v-if="isSupervisor" 
          size="lg" 
          variant="ghost"
          class="w-full justify-start" 
          @click="goToVehicles"
        >
          <template #leading>
            <UIcon name="i-lucide-car" class="text-xl" />
          </template>
          Gerenciar veículos
        </UButton>

        <UButton 
          v-if="isSupervisor" 
          size="lg" 
          variant="ghost"
          class="w-full justify-start" 
          @click="goToRoutes"
        >
          <template #leading>
            <UIcon name="i-lucide-route" class="text-xl" />
          </template>
          Gerenciar rotas
        </UButton>

        <UButton 
          v-if="isAdmin" 
          size="lg" 
          variant="ghost"
          class="w-full justify-start" 
          @click="goToSupervisors"
        >
          <template #leading>
            <UIcon name="i-lucide-shield" class="text-xl" />
          </template>
          Gerenciar supervisores
        </UButton>
      </div>
    </template>

    <template #footer>
      <UButton 
        size="lg" 
        color="error"
        variant="solid"
        class="w-full" 
        @click="handleSignOut"
      >
        <template #leading>
          <UIcon name="i-lucide-log-out" class="text-xl" />
        </template>
        Sair
      </UButton>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';

const props = defineProps<{ name?: string }>();
const emit = defineEmits<{
  (e: 'signout'): void;
}>();

const authStore = useAuthStore();
const router = useRouter();
const isOpen = ref(false);

const displayName = computed(() => {
  if (props.name && props.name.length) return props.name;
  const user = authStore.user;
  if (!user) return '';
  return user.firstName || user.name || user.email || '';
});

const userRole = computed(() => {
  const user = authStore.user;
  if (!user?.role) return '';
  
  const roleMap: Record<string, string> = {
    'PASSAGEIRO': 'Passageiro',
    'MOTORISTA': 'Motorista',
    'SUPERVISOR': 'Supervisor',
    'ADMINISTRADOR': 'Administrador',
  };
  
  return roleMap[user.role] || user.role;
});

const userAvatar = computed(() => {
  const user = authStore.user;
  
  if (!user?.avatarBase64) {
    return {
      icon: 'i-lucide-user'
    };
  }
  
  return {
    src: user.avatarBase64,
    icon: 'i-lucide-user'
  };
});

const isSupervisor = computed(() => {
  const user = authStore.user;
  return user?.role === 'SUPERVISOR';
});

const isAdmin = computed(() => {
  const user = authStore.user;
  return user?.role === 'ADMINISTRADOR';
});

const goToProfile = () => {
  isOpen.value = false;
  router.push('/profile');
};

const goToDrivers = () => {
  isOpen.value = false;
  router.push('/drivers');
};

const goToVehicles = () => {
  isOpen.value = false;
  router.push('/vehicles');
};

const goToRoutes = () => {
  isOpen.value = false;
  router.push('/routes/manage');
};

const goToSupervisors = () => {
  isOpen.value = false;
  router.push('/supervisors');
};

const handleSignOut = () => {
  isOpen.value = false;
  emit('signout');
};
</script>
