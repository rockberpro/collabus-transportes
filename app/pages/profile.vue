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
              <InputTextLarge v-model="person.cpf" id="cpf" placeholder="CPF" />
            </UFormField>

            <UFormField label="Data de nascimento" name="birthDate">
              <InputTextLarge type="date" v-model="birthDateString" id="birthDate" />
            </UFormField>
          </div>

          <div class="max-w-xs">
            <UFormField label="Telefone" name="phone">
              <InputTextLarge v-model="person.phone" id="phone" placeholder="Telefone" />
            </UFormField>
          </div>

          <UFormField label="Endereço" name="address">
            <InputTextLarge v-model="person.address" id="address" placeholder="Endereço" />
          </UFormField>
        </div>

        <div class="flex justify-end">
          <ButtonLarge type="submit">Salvar</ButtonLarge>
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

definePageMeta({
  middleware: ["authenticated"],
  layout: "default",
});

const authStore = useAuthStore();
const { user } = authStore;
const { getPersonByUserId, createPerson, updatePerson } = usePerson();

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

const birthDateString = ref('');

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
      cpf: person.cpf,
      phone: person.phone,
      address: person.address,
      birthDate: birthDateString.value ? new Date(birthDateString.value) : undefined,
    };

    if (person.id) {
      await updatePerson(person.id, payload as any);
    } else {
      const created = await createPerson(payload as any);
      if (created && created.data) person.id = created.data.id;
    }

    // feedback: use alert as fallback
    alert('Dados salvos com sucesso');
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar dados');
  }
};
</script>
