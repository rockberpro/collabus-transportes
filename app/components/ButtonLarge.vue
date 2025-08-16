<template>
  <UButton
    :color="color"
    :variant="variant"
    class="w-full h-12 justify-center"
    size="xl"
  >
    <slot />
  </UButton>
</template>

<script lang="ts">
import { defineProps } from "vue";

defineProps({
  color: {
    type: String,
    default: "primary",
  },
  variant: {
    type: String,
    default: "solid",
  },
});
</script>
