<template>
  <UInput
    :id="id"
    :placeholder="placeholder"
    :icon="icon"
    :trailing-icon="trailingIcon"
    :required="required"
    class="w-full text-xl"
    size="xl"
  />
</template>
<script setup lang="ts">
defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: false,
    default: "text",
  },
  placeholder: {
    type: String,
    required: false,
    default: "",
  },
  icon: {
    type: String,
    required: false,
  },
  trailingIcon: {
    type: String,
    required: false,
  },
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
