<template>
  <UInput
    :id="id"
    :type="type"
    :placeholder="placeholder"
    :icon="icon"
    :required="required"
    class="w-full text-xl"
    size="xl"
  >
  <UIcon
    v-if="trailingIcon"
    :name="trailingIcon"
    class="absolute right-3 top-3 cursor-pointer"
    @click="$emit('trailing-click')"
  />
  </UInput>
</template>
<script setup lang="ts">
const emit = defineEmits(['trailing-click'])

defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: false,
    default: "password",
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
