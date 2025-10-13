<template>
  <div class="flex flex-col justify-start items-start">
    <ButtonSmall variant="ghost" color="neutral" @click="handleBack">
      <div class="inline-flex flex-col items-center text-sm">
        <UIcon name="mdi:arrow-back" :size="20" />
        <span>Voltar</span>
      </div>
    </ButtonSmall>
  </div>
</template>

<script setup lang="ts">
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
