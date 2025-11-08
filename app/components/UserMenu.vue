<template>
  <div ref="wrapper" class="relative">
    <div class="cursor-pointer" @click="toggle">
      <UUser
        :name="displayName"
        :avatar="{
          src: 'https://i.pravatar.cc/150?img=13',
          icon: 'i-lucide-image'
        }"
      />
    </div>

    <transition name="fade">
      <div
        v-if="open"
        class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded shadow-lg z-50 py-1"
      >
        <div class="p-2">
          <UButton size="sm" class="w-full mb-2" @click="goToProfile">Sobre mim</UButton>
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
</script>
