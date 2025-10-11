<template>
  <nav class="fixed bottom-0 left-0 right-0 border-t z-50 dark:border-gray-700">
    <div class="max-w-5xl mx-auto px-4">
      <div class="flex justify-between items-center py-3">
        <ButtonLarge
          variant="ghost"
          color="neutral"
          class="flex-1 text-center p-2"
          @click="navigateTo('/home')"
        >
          <div class="inline-flex flex-col items-center text-sm">
            <UIcon name="mdi:home-outline" :size="20" />
            <span>Início</span>
          </div>
        </ButtonLarge>
        <!-- TODO: @click="navigateTo('/map') -->
        <ButtonLarge
          variant="ghost"
          color="neutral"
          class="flex-1 text-center p-2"
          @click="navigateTo('/404')"
        >
          <div class="inline-flex flex-col items-center text-sm">
            <UIcon name="mdi:map-outline" :size="20" />
            <span>Mapa</span>
          </div>
        </ButtonLarge>
        <!-- TODO: @click="navigateTo('/schedule') -->
        <ButtonLarge
          variant="ghost"
          color="neutral"
          class="flex-1 text-center p-2"
          @click="navigateTo('/404')"
        >
          <div class="inline-flex flex-col items-center text-sm">
            <UIcon name="mdi:clock-outline" :size="20" />
            <span>Horários</span>
          </div>
        </ButtonLarge>
        <!-- TODO: @click="navigateTo('/routes') -->
        <ButtonLarge
          variant="ghost"
          color="neutral"
          class="flex-1 text-center p-2"
          @click="navigateTo('/404')"
        >
          <div class="inline-flex flex-col items-center text-sm">
            <UIcon name="mdi:magnify-expand" :size="20" />
            <span>Rotas</span>
          </div>
        </ButtonLarge>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>
