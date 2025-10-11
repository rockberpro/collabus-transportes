<template>
  <div>
    <div class="flex flex-col justify-left items-left">
      <div class="text-2xl font-bold p-4">
        <UButton
          variant="ghost"
          color="neutral"
          class="flex-1 text-center p-2"
          @click="handleBack"
        >
          <div class="inline-flex flex-col items-center text-sm">
            <UIcon name="mdi:arrow-back" :size="20" />
            <span>Voltar</span>
          </div>
        </UButton>
      </div>
    </div>
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-6xl">404</h1>
      <p>Oops! A página que você procura não existe.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();

function handleBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    router.push("/home");
  }
}
</script>
