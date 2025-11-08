<template>
  <InputTextLarge
    v-model="display"
    :id="id || ''"
    :placeholder="placeholder || 'dd/mm/aaaa'"
    maxlength="10"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue?: string | null; // ISO YYYY-MM-DD
  placeholder?: string;
  id?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const stripNonDigits = (v = '') => (v || '').toString().replace(/\D+/g, '');

const formatDigitsToDateMasked = (digits: string) => {
  const d = digits;
  const day = d.slice(0, 2);
  const month = d.slice(2, 4);
  const year = d.slice(4, 8);
  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;
  return `${day}/${month}${year ? '/' + year : ''}`;
};

const digitsToISO = (digits: string) => {
  if (digits.length !== 8) return '';
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${year}-${month}-${day}`;
};

const isoToDigits = (iso = '') => {
  if (!iso) return '';
  // expect YYYY-MM-DD
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  return `${d}${m}${y}`.slice(0, 8);
};

const display = ref('');

// initialize display when modelValue (ISO) changes
watch(
  () => props.modelValue,
  (iso) => {
    if (iso) {
      const digits = isoToDigits(iso);
      display.value = formatDigitsToDateMasked(digits);
    } else {
      display.value = '';
    }
  },
  { immediate: true }
);

// when user types, update display and emit ISO when complete
watch(
  display,
  (val) => {
    const digits = stripNonDigits(val).slice(0, 8);
    const masked = formatDigitsToDateMasked(digits);
    if (masked !== val) {
      display.value = masked;
      return;
    }

    const iso = digits.length === 8 ? digitsToISO(digits) : '';
    emit('update:modelValue', iso || null);
  }
);

onMounted(() => {
  // ensure initial value is synced
  if (props.modelValue) {
    const digits = isoToDigits(props.modelValue);
    display.value = formatDigitsToDateMasked(digits);
  }
});
</script>
