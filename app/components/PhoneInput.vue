<template>
  <InputTextLarge
    v-model="display"
    :id="id || ''"
    :placeholder="placeholder || '(99) 99999-9999'"
    maxlength="15"
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

const formatPhone = (value = '') => {
  const digits = stripNonDigits(value).slice(-11);
  if (!digits) return '';
  let d = digits;
  if (d.length <= 10) {
    const d1 = d.slice(0, 2);
    const p1 = d.slice(2, 6);
    const p2 = d.slice(6, 10);
    return `${d1 ? '(' + d1 + ') ' : ''}${p1 || ''}${p2 ? '-' + p2 : ''}`;
  } else {
    const d1 = d.slice(0, 2);
    const p1 = d.slice(2, 7);
    const p2 = d.slice(7, 11);
    return `${d1 ? '(' + d1 + ') ' : ''}${p1 || ''}${p2 ? '-' + p2 : ''}`;
  }
};

const digitsToStore = (value = '') => stripNonDigits(value).slice(-11);

const display = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      display.value = formatPhone(val);
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
    emit('update:modelValue', digits || null);
  }
);

onMounted(() => {
  if (props.modelValue) display.value = formatPhone(props.modelValue);
});
</script>