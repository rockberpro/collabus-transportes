<template>
  <div ref="wrapper" class="relative">
    <div class="cursor-pointer" @click="toggle">
      <UUser
        :name="displayName"
        :avatar="userAvatar"
      />
    </div>

    <transition name="fade">
      <div
        v-if="open"
        class="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-800 rounded shadow-lg z-50 py-1"
      >
        <div class="p-2">
          <UButton size="sm" class="w-full mb-2" @click="goToProfile">Sobre mim</UButton>
          <UButton 
            v-if="isSupervisor" 
            size="sm" 
            class="w-full mb-2" 
            @click="goToDrivers"
          >
            Gerenciar motoristas
          </UButton>
          <UButton 
            v-if="isSupervisor" 
            size="sm" 
            class="w-full mb-2" 
            @click="goToVehicles"
          >
            Gerenciar veículos
          </UButton>
          <UButton 
            v-if="isSupervisor" 
            size="sm" 
            class="w-full mb-2" 
            @click="goToRoutes"
          >
            Gerenciar rotas
          </UButton>
          <UButton 
            v-if="isAdmin" 
            size="sm" 
            class="w-full mb-2" 
            @click="goToSupervisors"
          >
            Gerenciar supervisores
          </UButton>
          <UButton size="sm" class="w-full" @click="$emit('signout')">Sair</UButton>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';

const props = defineProps<{ name?: string }>();
defineEmits<{
  (e: 'signout'): void;
}>();

const authStore = useAuthStore();

const open = ref(false);
const wrapper = ref<HTMLElement | null>(null);
const router = useRouter();

const displayName = computed(() => {
  if (props.name && props.name.length) return props.name;
  const user = authStore.user;
  if (!user) return '';
  return user.firstName || user.name || user.email || '';
});

const userAvatar = computed(() => {
  const user = authStore.user;
  
  // Se não tem avatar, retorna apenas ícone
  if (!user?.avatarBase64) {
    return {
      icon: 'i-lucide-user'
    };
  }
  
  // Se tem avatar, retorna a imagem base64
  return {
    src: user.avatarBase64,
    icon: 'i-lucide-user' // Fallback icon
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

const toggle = () => {
  open.value = !open.value;
};

const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node;
  if (!wrapper.value) return;
  if (!wrapper.value.contains(target)) {
    open.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleDocumentClick));
onUnmounted(() => document.removeEventListener('click', handleDocumentClick));

const goToProfile = () => {
  open.value = false;
  router.push('/profile');
};

const goToDrivers = () => {
  open.value = false;
  router.push('/drivers');
};

const goToVehicles = () => {
  open.value = false;
  router.push('/vehicles');
};

const goToRoutes = () => {
  open.value = false;
  router.push('/routes/manage');
};

const goToSupervisors = () => {
  open.value = false;
  router.push('/supervisors');
};
</script>
