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

<script setup lang="ts">
interface Props {
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral";
  variant?:
    | "solid"
    | "link"
    | "outline"
    | "soft"
    | "subtle"
    | "ghost";
}

withDefaults(defineProps<Props>(), {
  color: "primary",
  variant: "solid",
});
</script>
