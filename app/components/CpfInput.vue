<template>
  <InputTextLarge
    v-model="display"
    :id="id || ''"
    :placeholder="placeholder || '000.000.000-00'"
    maxlength="14"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue?: string | null; // digits only
  placeholder?: string;
  id?: string;
}>();
const emit = defineEmits(['update:modelValue']);

const stripNonDigits = (v = '') => (v || '').toString().replace(/\D+/g, '');

const formatCpf = (value = '') => {
  const digits = stripNonDigits(value).slice(0, 11);
  if (!digits) return '';
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  return [part1, part2, part3]
    .filter(Boolean)
    .join('.') + (part4 ? '-' + part4 : '');
};

const digitsToStore = (value = '') => stripNonDigits(value).slice(0, 11);

const display = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      display.value = formatCpf(val);
    } else {
      display.value = '';
    }
  },
  { immediate: true }
);

watch(
  display,
  (val) => {
    const digits = digitsToStore(val);
    // update model with digits (empty => null)
    emit('update:modelValue', digits || null);
  }
);

onMounted(() => {
  if (props.modelValue) display.value = formatCpf(props.modelValue);
});
</script>
