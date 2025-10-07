<template>
  <div class="flex items-center justify-center min-h-full p-8">
    <div class="w-full max-w-2xl">
      <h1 class="text-2xl font-semibold mb-4">Sobre mim</h1>

      <UForm @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 mb-4">
          <UFormField label="Nome" name="firstName">
            <InputTextLarge v-model="person.firstName" id="firstName" placeholder="Nome" />
          </UFormField>

          <UFormField label="Sobrenome" name="lastName">
            <InputTextLarge v-model="person.lastName" id="lastName" placeholder="Sobrenome" />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="CPF" name="cpf">
              <CpfInput v-model="person.cpf" id="cpf" placeholder="000.000.000-00" />
            </UFormField>

            <UFormField label="Data de nascimento" name="birthDate">
              <DateMaskedInput v-model="birthDateString" id="birthDate" placeholder="dd/mm/aaaa" />
            </UFormField>
          </div>

          <div class="max-w-xs">
            <UFormField label="Telefone" name="phone">
              <InputTextLarge v-model="phoneMasked" id="phone" placeholder="(99) 99999-9999" maxlength="15" />
            </UFormField>
          </div>

          <UFormField label="Endereço" name="address">
            <InputTextLarge v-model="person.address" id="address" placeholder="Endereço" />
          </UFormField>
        </div>

        <div class="py-5">
          <div class="flex justify-end">
            <ButtonLarge type="submit">Salvar</ButtonLarge>
          </div>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePerson } from '@/composables/usePerson';
import type { Person } from '../../types/person';
import DateMaskedInput from '@/components/DateMaskedInput.vue';
import CpfInput from '@/components/CpfInput.vue';

const authStore = useAuthStore();
const { user } = authStore;
const { getPersonByUserId, createPerson, updatePerson } = usePerson();
const toast = useToast();

const person = reactive<Partial<Person>>({
  id: undefined,
  firstName: '',
  lastName: '',
  cpf: '',
  phone: '',
  address: '',
  birthDate: undefined,
  createdAt: new Date(),
});

const birthDateString = ref(''); // ISO 'YYYY-MM-DD' or empty

const stripNonDigits = (v = '') => (v || '').toString().replace(/\D+/g, '');

const formatPhone = (value = '') => {
  const digits = stripNonDigits(value);
  if (!digits) return '';
  // remove country code if present (optional): keep last 10-11 digits
  let d = digits;
  if (d.length > 11) d = d.slice(-11);
  if (d.length <= 10) {
    // (xx) xxxx-xxxx
    const d1 = d.slice(0, 2);
    const p1 = d.slice(2, 6);
    const p2 = d.slice(6, 10);
    return `${d1 ? '(' + d1 + ') ' : ''}${p1 || ''}${p2 ? '-' + p2 : ''}`;
  } else {
    // length 11 -> (xx) xxxxx-xxxx
    const d1 = d.slice(0, 2);
    const p1 = d.slice(2, 7);
    const p2 = d.slice(7, 11);
    return `${d1 ? '(' + d1 + ') ' : ''}${p1 || ''}${p2 ? '-' + p2 : ''}`;
  }
};

const phoneMasked = computed({
  get() {
    return formatPhone(person.phone || '');
  },
  set(v: string) {
    // store only digits up to 11 characters
    const digits = stripNonDigits(v).slice(0, 11);
    person.phone = digits;
  },
});

const load = async () => {
  if (!user?.id) return;
  try {
    const res = await getPersonByUserId(user.id);
    if (res && res.data) {
      Object.assign(person, res.data);
      birthDateString.value = person.birthDate
        ? new Date(person.birthDate).toISOString().slice(0, 10)
        : '';
    }
  } catch (err) {
    console.error('Erro ao carregar pessoa:', err);
  }
};

onMounted(load);

const save = async () => {
  try {
    const payload = {
      firstName: person.firstName,
      lastName: person.lastName,
      cpf: stripNonDigits(person.cpf || ''),
      phone: stripNonDigits(person.phone || ''),
      address: person.address,
      birthDate: birthDateString.value ? new Date(birthDateString.value) : undefined,
    };

    if (person.id) {
      await updatePerson(person.id, payload as any);
    } else {
      const created = await createPerson(payload as any);
      if (created && created.data) person.id = created.data.id;
    }

    // feedback via toast
    toast.add({
      title: 'Sucesso',
      description: 'Dados salvos com sucesso',
      color: 'success',
    });
  } catch (err) {
    console.error(err);
    toast.add({
      title: 'Erro',
      description: 'Erro ao salvar dados',
      color: 'error',
    });
  }
};
</script>
